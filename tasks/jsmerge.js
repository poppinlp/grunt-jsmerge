var uglifyjs = require('uglify-js');

module.exports = function (grunt) {
    grunt.registerTask('jsmerge', 'Import javascript file', function () {
        var config = grunt.config.get('jsmerge'),
            ln = grunt.util.linefeed,
            globalOptions = {
                cache: './.cache/',
                uglify: true,
                uglifyopt: {
                    sourceMap: false
                },
                jshint: true,
                jshintrc: './config/jshintrc',
                newer: true
            },
            done = this.async(),
            taskOptions = {},
            task, dep;

        for (task in config) {
            if (config.hasOwnProperty(task)) {
                if (task === 'options') {
                    globalOptions = config[task];
                } else {
                    doTask(config[task]);
                }
            }
        }

        function doTask (task) {
            var target,
                options = {},
                result;

            dep = {};
            grunt.file.recurse(task.files.src, function (path, root, sub, file) {
                if (file[0] === '_' || file[0] === '.' || path[0] === '.' || (sub && sub[0] === '.')) return;

                taskOptions = task.options ? task.options : {};
                options = extend(options, globalOptions);
                options = extend(options, taskOptions);
                target = task.files.dest + (sub ? sub : '') + file;
                result = importFile(path, root, sub, file);

                clearCache(options.cache);
                grunt.file.write(options.cache + file, result, { encoding: 'utf8' });
                jshint(options, path, file, target);
            });
        }

        function jshint (options, path, file, target) {
            if (options.jshint) {
                grunt.util.spawn({
                    cmd: './node_modules/.bin/jshint',
                    args: [
                        options.cache + file,
                        '--config'
                    ]
                }, function (err, std) {
                    if (std.stderr) {
                        grunt.fail.fatal(std.stder);
                    } else if (std.stdout) {
                            grunt.log.error(std.stdout);
                    } else {
                        uglify(options, path, file, target);
                    }
                });
            } else {
                uglify(options, path, file, target);
            }
        }

        function uglify (options, path, file, target) {
            var result = {},
                opt = {};

            if (options.uglify) {
                options.uglifyopt = extend(globalOptions.uglifyopt, options.uglifyopt);
                if (options.uglifyopt.sourceMap) {
                    opt.outSourceMap = file.slice(0, -2) + 'map';
                }
                result = uglifyjs.minify([options.cache + file], opt);
                if (options.uglifyopt.sourceMap) {
                    grunt.file.write(target.slice(0, -2) + 'map', result.map, { encoding: 'utf8' });
                }
            } else {
                result.code = grunt.file.read(options.cache + file, { encoding: 'utf8' });
            }
            console.log(result);
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
