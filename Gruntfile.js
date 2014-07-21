module.exports = function(grunt) {
    grunt.config.init({
        jshint: {
            options: grunt.file.readJSON(__dirname + '/config/jshintrc'),
            www: {
                src: ['tasks/jsmerge.js']
            }
        },
        jsmerge: {
            options: {
                uglifyopt: {
                    sourceMap: true,
                    sourceRoot: '',
                    warnings: true,
                    mangle: false
                }
            },
            dist: {
                files: {
                    src: 'test/src/',
                    dest: 'test/dest/'
                }
            }
        }
    });
    grunt.loadTasks('tasks/');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('test', ['jshint', 'jsmerge']);
};
