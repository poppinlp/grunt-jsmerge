#grunt-jsmerge
Grunt task to merge import javascript file except `_filename` and `.filename`.

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
