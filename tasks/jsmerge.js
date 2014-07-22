var uglifyjs = require('uglify-js'),
    queue = require('queue');

module.exports = function (grunt) {
    grunt.registerTask('jsmerge', 'Import javascript file', function () {
        var config = grunt.config.get('jsmerge'),
            ln = grunt.util.linefeed,
            cwd = __dirname + '/../',
            globalOptions = {
                cache: cwd + '.cache/',
                uglify: true,
                uglifyopt: {
                    sourceMap: false
                },
                jshint: true,
                jshintrc: cwd + 'config/jshintrc',
                newer: true
            },
            taskQueue = queue({
                timeout: 5000,
                concurrency: 1
            }),
            done = this.async(),
            taskOptions = {},
            task, dep;

        if (config.options) {
            globalOptions = extend(globalOptions, config.options);
        }
        clearCache(globalOptions.cache);

        for (task in config) {
            if (config.hasOwnProperty(task)) {
                if (task !== 'options') {
                    doTask(config[task]);
                }
            }
        }
        taskQueue.on('end', function () {
            done();
        });
        taskQueue.start();

        function doTask (task) {
            var target,
                options = {},
                result;

            grunt.file.recurse(task.files.src, function (path, root, sub, file) {
                if (file[0] === '_' || file[0] === '.' || path[0] === '.' || (sub && sub[0] === '.')) return;

                dep = {};
                taskOptions = task.options ? task.options : {};
                options = extend(options, globalOptions);
                options = extend(options, taskOptions);
                target = task.files.dest + (sub ? sub : '') + file;
                result = importFile(path, root, sub, file);

                grunt.file.write(options.cache + file, result, { encoding: 'utf8' });
                jshint(options, path, file, target);
            });
        }

        function jshint (options, path, file, target) {
            if (options.jshint) {
                taskQueue.push(function (cb) {
                    grunt.util.spawn({
                        cmd: cwd + 'node_modules/.bin/jshint',
                        args: [
                            options.cache + file,
                            '--config'
                        ]
                    }, function (err, std) {
                        if (std.stderr) {
                            grunt.fail.fatal(std.stderr);
                        } else if (std.stdout) {
                                grunt.log.error(std.stdout);
                        } else {
                            uglify(options, path, file, target);
                        }
                        cb();
                    });
                });
            } else {
                uglify(options, path, file, target);
            }
        }

        function uglify (options, path, file, target) {
            var result = {},
                opt = {},
                swapOpt = options.uglifyopt;

            if (options.uglify) {
                swapOpt = extend(globalOptions.uglifyopt, options.uglifyopt);
                if (swapOpt.sourceMap) {
                    opt.outSourceMap = file.slice(0, -2) + 'map';
                }
                opt.sourceRoot = swapOpt.sourceRoot;
                opt.warnings = swapOpt.warnings;
                result = uglifyjs.minify([options.cache + file], opt);
                if (options.uglifyopt.sourceMap) {
                    grunt.file.write(target.slice(0, -2) + 'map', result.map, { encoding: 'utf8' });
                }
            } else {
                result.code = grunt.file.read(options.cache + file, { encoding: 'utf8' });
            }
            grunt.file.write(target, result.code, { encoding: 'utf8' });
            grunt.log.ok('Jsmerge build ' + path + ' => ' + target + ' successfully.');
        }

        function importFile (path, root, sub, file) {
            var reg = new RegExp('\\$import [\'\"].+[\'\"];' + ln, 'ig'),
                result, files, len, importName, importPath, i;

            result = grunt.file.read(path, { encoding: 'utf8' });
            files = result.match(reg);

            if (files) {
                len = files.length;
                for (i = 0; i < len; i++) {
                    try {
                        importName = files[i].slice(9, -2 - ln.length);
                        importPath = root + (sub ? sub : '') + importName;
                        result = result.replace(files[i], dep[importPath] ? '' : importFile(importPath, root, sub, importName));
                        dep[importPath] = true;
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

        function clearCache (cache) {
            grunt.file.recurse(cache, function (path, root, sub, file) {
                if (path[0] === '.') return;
                grunt.file['delete'](path);
            });
        }
    });
};
