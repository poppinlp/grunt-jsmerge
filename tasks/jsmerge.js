/*
 * grunt-jsmerge
 * https://github.com/poppinlp/grunt-jsmerge
 *
 * Copyright (c) 2014 "PoppinLp" Liang Peng
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    grunt.registerTask('jsmerge', 'Import javascript file', function () {
        var uglifyjs = require('uglify-js'),
            queue = require('queue'),
            fs = require('fs'),
            config = grunt.config.get('jsmerge'),
            ln = grunt.util.linefeed,
            cwd = __dirname + '/../',
            globalOptions = {
                uglify: true,
                uglifyopt: {
                    sourceMap: false
                },
                jshint: true,
                jshintrc: cwd + 'config/jshintrc',
                newer: true,
                concurrency: 4
            },
            done = this.async(),
            taskOptions = {},
            success = true,
            timestampPath = cwd + 'config/timestamp.json',
            timestamp = {},
            defaultTimestamp = {},
            dependencePath = cwd + 'config/dependence.json',
            dependence = {},
            defaultDependence = {
                have: {},
                bein: {}
            },
            encoding = {
                encoding: 'utf8'
            },
            taskQueue,
            fileQueue = {},
            task, dep, item;

        // read globaloptions
        if (config.options) {
            globalOptions = extend(globalOptions, config.options);
        }
        // init taskQueue
        taskQueue = queue({
            timeout: 10000,
            concurrency: globalOptions.concurrency
        });
        // read timestamp
        if (globalOptions.newer) {
            try {
                timestamp = grunt.file.readJSON(timestampPath, encoding);
            } catch (err) {
                timestamp = defaultTimestamp;
            }
            try {
                dependence = grunt.file.readJSON(dependencePath, encoding);
            } catch (err) {
                dependence = defaultDependence;
            }
        }

        for (task in config) {
            if (config.hasOwnProperty(task)) {
                if (task !== 'options') {
                    grunt.file.recurse(config[task].files.src, collectFile);
                }
            }
        }

        taskQueue.on('end', function () {
            if (globalOptions.newer) {
                grunt.file.write(timestampPath, JSON.stringify(timestamp), encoding);
                grunt.file.write(dependencePath, JSON.stringify(dependence), encoding);
            }
            done(success);
        });

        for (item in fileQueue) {
            if (fileQueue.hasOwnProperty(item)) {
                doFile(fileQueue[item]);
            }
        }
        taskQueue.start();

        function addFile (path, root, sub, file) {
            if (fileQueue[path]) return;
            fileQueue[path] = {
                path: path,
                root: root,
                sub: sub,
                file: file
            };
        }

        function collectFile (path, root, sub, file, flag) {
            var item, data, lastChange;

            if (file[0] === '.' || path[0] === '.' || (sub && sub[0] === '.') && flag !== true) return;

            lastChange = fs.statSync(path).mtime.getTime();
            if (globalOptions.newer && timestamp[path] && timestamp[path] === lastChange && flag !== true) {
                return;
            }
            timestamp[path] = lastChange;

            if (file[0] === '_') {
                if (dependence.bein[path]) {
                    for (item in dependence.bein[path]) {
                        if (dependence.bein[path].hasOwnProperty(item)) {
                            data = dependence.bein[path][item];
                            collectFile(data.path, data.root, data.sub, data.file, true);
                        }
                    }
                }
            } else {
                addFile(path, root, sub, file);
            }
        }

        function doFile (arg) {
            var options = {},
                path = arg.path,
                root = arg.root,
                sub = arg.sub,
                file = arg.file,
                target,
                result;

            dep = {};
            taskOptions = task.options ? task.options : {};
            options = extend(options, globalOptions);
            options = extend(options, taskOptions);
            target = config[task].files.dest + (sub ? sub : '') + file;
            result = importFile(path, root, sub, file);

            // write source file
            grunt.file.write(target, result, encoding);

            // jshint
            (function () {
                var tmpOptions = options,
                    tmpPath = path,
                    tmpFile = file,
                    tmpTarget = target;

                if (tmpOptions.jshint) {
                    taskQueue.push(function (cb) {
                        grunt.util.spawn({
                            cmd: cwd + 'node_modules/.bin/jshint',
                            args: [
                                tmpTarget,
                                '--config',
                                tmpOptions.jshintrc
                            ]
                        }, function (err, std) {
                            if (std.stderr) {
                                grunt.fail.fatal(std.stderr);
                            } else if (std.stdout) {
                                grunt.log.error(std.stdout);
                                if (timestamp[path]) {
                                    delete timestamp[path];
                                }
                                success = false;
                            } else {
                                uglify(tmpOptions, tmpPath, tmpFile, tmpTarget);
                            }
                            cb();
                        });
                    });
                } else {
                    uglify(tmpOptions, tmpPath, tmpFile, tmpTarget);
                }
            })();
        }

        function uglify (options, path, file, target) {
            var result = {},
                opt = {},
                swapOpt = options.uglifyopt;

            if (options.uglify) {
                swapOpt = extend(globalOptions.uglifyopt, options.uglifyopt);
                if (swapOpt.sourceMap) {
                    opt.outSourceMap = file + '.map';
                }
                opt.sourceRoot = swapOpt.sourceRoot;
                opt.warnings = swapOpt.warnings;
                result = uglifyjs.minify([target], opt);
                if (options.uglifyopt.sourceMap) {
                    grunt.file.write(target + '.map', result.map, encoding);
                }
            } else {
                result.code = grunt.file.read(target, encoding);
            }
            target = target.slice(0, -2) + 'min.js';
            grunt.file.write(target, result.code, encoding);
            grunt.log.ok('Jsmerge build ' + path + ' => ' + target + ' successfully.');
        }

        function importFile (path, root, sub, file) {
            var reg = new RegExp('\\$import [\'\"].+[\'\"];' + ln, 'ig'),
                result, files, len, importName, importPath, i;

            result = grunt.file.read(path, encoding);
            files = result.match(reg);

            // autoclear the dependence on this file and rebuild it again
            dependence.have[path] = {};

            if (files) {
                len = files.length;
                for (i = 0; i < len; i++) {
                    try {
                        importName = files[i].slice(9, -2 - ln.length);
                        importPath = root + (sub ? sub : '') + importName;
                        result = result.replace(files[i], dep[importPath] ? '' : importFile(importPath, root, sub, importName));
                        dep[importPath] = true;
                        dependence.have[path][importPath] = {
                            path: path,
                            root: root,
                            sub: sub,
                            file: file
                        };
                        if (!dependence.bein[importPath]) {
                            dependence.bein[importPath] = {};
                        }
                        dependence.bein[importPath][path] = {
                            path: path,
                            root: root,
                            sub: sub,
                            file: file
                        };
                    } catch (err) {
                        grunt.fail.fatal(path + ln + err);
                    }
                }
            }
            return result;
        }

        function extend (self, other) {
            var key;
            for (key in other) {
                if (other.hasOwnProperty(key)) {
                    self[key] = other[key];
                }
            }
            return self;
        }
    });
};
