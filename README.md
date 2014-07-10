#grunt-jsmerge
Grunt task to merge import javascript file like sass and ignore `_filename` and `.filename`.

To use this plugin with jshint and uglify may be a good idea.

###Example

foo.js:

```js
var foo = 1;
$import '_foobar.js';
console.log(foo + bar);
```

_foobar.js:

```
var bar = 2;
```

Gruntfile.js:

```
grunt.config.init({
    jsmerge: {
        dist: {
            files: {
                src: 'test/src',
                dest: 'test/dest'
            }
        }
    }
});
```

###Demo

```
grunt test
```

###Version

- Ver 0.0.5 Bugfix again
- Ver 0.0.4 Bugfix
- Ver 0.0.3 Support recurse import file and auto ignore the same file in a file import recurse.
- Ver 0.0.2 Ignore `_file` and `.file`.
- Ver 0.0.1 Main.
