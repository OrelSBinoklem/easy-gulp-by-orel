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
        seedingData: false,
        pug: true,
        pugOptions: {
            pretty: '\t'
        },
        fileInclude: false,
        fileIncludeOptions: {
            prefix: '@@',
            basepath: '@file'
        },
        changed: true
    }, options);

    return function() {
        const htmlFilter = $.filter('**/*.{html,htm}', {restore: true});
        const pugFilter = $.filter('**/*.{pug,jade}', {restore: true});

        var seedingData;
        if((options.fileInclude || options.pug) && options.seedingData) {
            seedingData = JSON.parse(fs.readFileSync('base_src' in options ? pathJoin(process.cwd(), options.base_src, options.seedingData) : pathJoin(process.cwd(), options.seedingData)));
        }

        if(options.pug && !("data" in options.pugOptions) && options.seedingData) {
            options.pugOptions.data = seedingData;
        }

        if(options.fileInclude && !("context" in options.fileIncludeOptions) && options.seedingData) {
            options.fileIncludeOptions.context = seedingData;
        }

        var stream = combine(
            gulp.src(options.src),

            "ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine(),

            $.if(options.changed, $.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest, {extension: '.html'})),

            htmlFilter, $.if(options.fileInclude, combine($.if(options.sourcemaps, $.sourcemaps.init()), $.fileInclude(options.fileIncludeOptions), $.if(options.sourcemaps, $.sourcemaps.write('.')))), htmlFilter.restore,

            pugFilter, $.if(options.pug, combine($.if(options.sourcemaps, $.sourcemaps.init()), $.pug(options.pugOptions), $.if(options.sourcemaps, $.sourcemaps.write('.')))), pugFilter.restore
        ).on('error', $.notify.onError());

        stream.pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError())
            .pipe("writeHTMLHandler" in options ? options.writeHTMLHandler() : combine())
            .on('error', $.notify.onError());

        return stream;
    };

};