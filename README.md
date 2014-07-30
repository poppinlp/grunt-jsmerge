# Grunt-jsmerge

[![Build Status](https://travis-ci.org/poppinlp/grunt-jsmerge.png?branch=master)](https://travis-ci.org/poppinlp/grunt-jsmerge)

Grunt task to import javascript file. Ignore `_filename` and `.filename`.

### Getting Started

This plugin requires Grunt >=0.4.0

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-jsmerge --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-jsmerge');
```

### Jsmerge Task

_Run this task with the `grunt jsmerge` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

### Options

#### src

Source path.

#### dest

Destination path.

#### cache

Cache path. Default `'node_modules/grunt-jsmerge/.cache'`. Only work in global options.

#### uglify

To use uglify or not. Default `true`.

#### uglifyopt

Options for uglify. Below is list and default value.

- sourceMap : false
- sourceRoot : ''
- warnings : false
- mangle : true

#### jshint

To use jshint or not. Default `true`.

#### jshintrc

The `jshintrc` file path. Default `'node_modules/grunt-jsmerge/config/jshintrc'`.

#### concurrency

The max count for build file at the same time. Default `4`. Only work in global options.

#### newer

Only build changed file and new file. Default `true`. Only work in global options.

### Usage Examples

#### Basic

```js
// foo.js:
var foo = 1;
$import '_foobar.js';
console.log(foo + bar);
```

```js
// _foobar.js:
var bar = 2;
```

```js
// Project configuration
grunt.config.init({
    jsmerge: {
        dist: {
            src: 'test/src',
            dest: 'test/dest'
        }
    }
});
```

#### Use options

```js
// Project configuration
grunt.config.init({
    jsmerge: {
        dist: {
            files: {
                src: 'test/src',
                dest: 'test/dest'
            },
            options: {
                jshint: true
            }
        }
    }
});
```

#### Use global options

```js
// Project configuration
grunt.config.init({
    jsmerge: {
        options: {
            uglify: true
        },
        dist: {
            files: {
                src: 'test/src',
                dest: 'test/dest',
            },
            options: {
                jshint: true
            }
        }
    }
});
```

### Demo

Run the test demo:

```shell
grunt test
```

### History

- Ver 0.1.4 Bugfix
- Ver 0.1.3 Some fix
- Ver 0.1.2 First stable version
- Ver 0.1.1 Fix timestamp bug
- Ver 0.1.0 Bugfix
- Ver 0.0.15
    - Bugfix
    - Add `concurrency`, `newer` option
    - Add travis
- Ver 0.0.14 Optimize
- Ver 0.0.13 Bugfix
- Ver 0.0.12 Bugfix
- Ver 0.0.11 Bugfix
- Ver 0.0.10 Bugfix
- Ver 0.0.9
    - Add `sourceRoot`, `warnings`, `mangle` for uglify options
    - Fix globalOptions not work
- Ver 0.0.8 Bugfix
- Ver 0.0.7 Bugfix
- Ver 0.0.6
    - Reconstruction code
    - Built-in jshint
    - Built-in uglify
- Ver 0.0.5 Bugfix again
- Ver 0.0.4 Bugfix
- Ver 0.0.3 Support recurse import file and auto ignore the same file in a file import recurse
- Ver 0.0.2 Ignore `_file` and `.file`
- Ver 0.0.1 Main
