module.exports = function (grunt) {
    grunt.registerTask('jsmerge', 'Merge javascript import file', function () {
        var list = grunt.config.get('jsmerge'),
            ln = grunt.util.linefeed,
            reg = new RegExp('\\$import [\'\"].+[\'\"];' + ln, 'ig'),
            item, files, text, target, len;

        for (item in list) {
            if (list.hasOwnProperty(item)) {
                files = list[item].files;
                grunt.file.recurse(files.src, function (path, root, sub, file) {
                    if (file[0] === '_' || file[0] === '.') return;
                    text = grunt.file.read(path, { encoding: 'utf8' });
                    target = text.match(reg);
                    if (target) {
                        len = target.length;
                        while (len--) {
                            try {
                                text = text.replace(target[len], grunt.file.read(root + (sub ? sub : '') + target[len].slice(9, -2 - ln.length)));
                            } catch (err) {
                                return grunt.warn(path + '\n' + err);
                            }
                        }
                    }
                    target = files.dest + (sub ? sub : '') + file;
                    grunt.file.write(target, text, { encoding: 'utf8' });
                    grunt.log.ok('Build ' + path + ' => ' + target + ' successfully.');
                });
            }
        }
    });
};
