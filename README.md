#grunt-jsmerge
Grunt task to merge import javascript file except `_filename` and `.filename`.

To use this plugin with jshint and uglify may be a good idea.

###Example config

```
grunt.config.init({
    jsmerge: {
        dist: {
            src: 'test/src',
            dest: 'test/dest'
        }
    }
});
```

###Demo

```
grunt test
```
