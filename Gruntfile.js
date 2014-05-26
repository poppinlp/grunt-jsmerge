module.exports = function(grunt) {
    grunt.config.init({
        jsmerge: {
            dist: {
                files: {
                    src: 'test/src/',
                    dest: 'test/dest/'
                }
            }
        }
    });
    grunt.loadTasks('tasks/');
    grunt.registerTask('test', ['jsmerge']);
};
