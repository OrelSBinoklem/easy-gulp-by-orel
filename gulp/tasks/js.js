'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combine = require('stream-combiner2').obj;
const extend = require('extend');
const pathJoin = require('../path.join.js');
const ignoreFiles = require("../ignore-files");

const through2 = require("through2").obj;

module.exports = function(options) {

    options = extend(true, {
        sourcemaps: false,
        minification: true,
        dest: "",
        coffeeOptions: {
            bare: true
        },
        changed: true
    }, options);

    return function() {
        const coffeeFilter = $.filter('**/*.coffee', {restore: true});

        var stream = combine(
            gulp.src(options.src),

            "ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine(),

            $.if(options.changed, $.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest, {extension: '.js'})),

            $.if(options.sourcemaps, $.sourcemaps.init()),

            coffeeFilter, $.coffee(options.coffeeOptions), coffeeFilter.restore,

            $.if(options.sourcemaps, $.sourcemaps.write('.'))
        ).on('error', $.notify.onError());

        stream.pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError())
            .pipe("writeJsStream" in options ? options.writeJsStream() : combine())
            .on('error', $.notify.onError());

        return stream;
    };

};