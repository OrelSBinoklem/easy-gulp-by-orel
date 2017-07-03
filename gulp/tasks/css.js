'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combine = require('stream-combiner2').obj;
const extend = require('extend');
const pathJoin = require('../path.join.js');
const ignoreFiles = require("../ignore-files");

const through2 = require("through2").obj;

module.exports = function(options) {

    options = extend({
        sourcemaps: false,
        autoprefixer: true,
        minification: true,
        dest: ""
    }, options);

    return function() {
        const stylFilter = $.filter('**/*.styl', {restore: true});
        const sassFilter = $.filter('**/*.{sass,scss}', {restore: true});
        const lessFilter = $.filter('**/*.less', {restore: true});

        var stream = combine(
                gulp.src(options.src),

                "ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine(),

                $.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest, {extension: '.css'}),

                $.if(options.sourcemaps, $.sourcemaps.init()),

                stylFilter, $.stylus(), stylFilter.restore,
                sassFilter, $.sass(), sassFilter.restore,
                lessFilter, $.less(), lessFilter.restore,

                $.if(options.autoprefixer, $.autoprefixer({
                    browsers: ['> 1%']})),
                $.if(options.minification, $.minifyCss()),

                $.if(options.sourcemaps, $.sourcemaps.write('.'))
        ).on('error', $.notify.onError());

        stream.pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError())
            .pipe("writeStyleStream" in options ? options.writeStyleStream() : combine())
            .on('error', $.notify.onError());

        return stream;
    };

};