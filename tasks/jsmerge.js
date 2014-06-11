module.exports = function (grunt) {
    grunt.registerTask('jsmerge', 'Merge javascript import file', function () {
        var list = grunt.config.get('jsmerge'),
            ln = grunt.util.linefeed,
            cache, item, files, text, target;

        for (item in list) {
            if (list.hasOwnProperty(item)) {
                files = list[item].files;
                grunt.file.recurse(files.src, function (path, root, sub, file) {
                    if (file[0] === '_' || file[0] === '.') return;
                    cache = {};
                    text = importFile(path, root, sub, file);
                    target = files.dest + (sub ? sub : '') + file;
                    grunt.file.write(target, text, { encoding: 'utf8' });
                    grunt.log.ok('Build ' + path + ' => ' + target + ' successfully.');
                });
            }
        }

        function importFile (path, root, sub, file) {
            var reg = new RegExp('\\$import [\'\"].+[\'\"];' + ln, 'ig'),
                len, text, target, importPath, importName, importText;

            text = grunt.file.read(path, { encoding: 'utf8' });
            target = text.match(reg);
            if (target) {
                len = target.length;
                while (len--) {
                    try {
                        importName = target[len].slice(9, -2 - ln.length);
                        importPath = root + (sub ? sub : '') + importName;
                        if (cache[importPath]) continue;
                        importText = grunt.file.read(importPath);
                        cache[importPath] = true;
                        if (importText.match(reg)) {
                            importText = importFile(importPath, root, sub, importName);
                        }
                        text = text.replace(target[len], importText);
                    } catch (err) {
                        grunt.fail.fatal(path + '\n' + err);
                    }
                }
            }
            return text;
        }
    });
};
