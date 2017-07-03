'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combine = require('stream-combiner2').obj;
const extend = require('extend');
const fs = require("fs");
const pathJoin = require('../path.join.js');
const ignoreFiles = require("../ignore-files");

module.exports = function(options) {

    options = extend(true, {
        sourcemaps: false,
        dest: "",
        pugOptions: {
            pretty: '\t'
        },
        includeHtml: true,
        includeHtmlOptions: {
            prefix: '@@',
            basepath: '@file'
        },
        changed: true
    }, options);

    return function() {
        const htmlFilter = $.filter('**/*.{html,htm}', {restore: true});
        const pugFilter = $.filter('**/*.{pug,jade}', {restore: true});

        if(!("data" in options.pugOptions) && "pugData" in options && !!options.pugData) {
            options.pugOptions.data = JSON.parse(fs.readFileSync('base_src' in options ? pathJoin(process.cwd(), options.base_src, options.pugData) : pathJoin(process.cwd(), options.pugData)));
        }

        var stream = combine(
            gulp.src(options.src),

            "ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine(),

            $.if(options.changed, $.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest, {extension: '.html'})),

            htmlFilter, $.if(options.includeHtml, combine($.if(options.sourcemaps, $.sourcemaps.init()), $.fileInclude(options.includeHtmlOptions), $.if(options.sourcemaps, $.sourcemaps.write('.')))), htmlFilter.restore,

            pugFilter, $.if(options.sourcemaps, $.sourcemaps.init()), $.pug(options.pugOptions), $.if(options.sourcemaps, $.sourcemaps.write('.')), pugFilter.restore
        ).on('error', $.notify.onError());

        stream.pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError())
            .pipe("writeHTMLHandler" in options ? options.writeHTMLHandler() : combine())
            .on('error', $.notify.onError());

        return stream;
    };

};