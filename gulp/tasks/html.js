'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combine = require('stream-combiner2').obj;
const through2 = require("through2").obj;
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
        pugInsertCurPage: true,
        fileInclude: false,
        fileIncludeOptions: {
            prefix: '@@',
            basepath: '@file'
        },
        changed: true,
        rigger: false
    }, options);

    return function() {
        const htmlFilter = $.filter('**/*.{html,htm}', {restore: true});
        const pugFilter = $.filter('**/*.{pug,jade}', {restore: true});

        var seedingData;
        if((options.fileInclude || options.pug) && options.seedingData) {
            seedingData = JSON.parse(fs.readFileSync('base_src' in options ? pathJoin(process.cwd(), options.base_src, options.seedingData) : pathJoin(process.cwd(), options.seedingData)));
        }

        if(options.pug && options.seedingData) {
            if("data" in options.pugOptions) {
                extend(true, options.pugOptions.data, seedingData);
            } else {
                options.pugOptions.data = seedingData;
            }
        }

        if(options.fileInclude && options.seedingData) {
            if("context" in options.fileIncludeOptions) {
                extend(true, options.fileIncludeOptions.context, seedingData);
            } else {
                options.fileIncludeOptions.context = seedingData;
            }
        }

        var stream = combine(
            gulp.src(options.src),

            "ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine(),

            $.if(options.changed, $.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest, {extension: '.html'})),

            $.if(options.sourcemaps, $.sourcemaps.init()),

            htmlFilter, $.if(options.fileInclude, combine($.fileInclude(options.fileIncludeOptions))), htmlFilter.restore,

            pugFilter, $.if(options.pug, combine($.if(options.pugInsertCurPage, through2(function(file, enc, callback){
                var name = /([^\\\/]+)\.(pug|jade)$/.exec(file.path)[1];
                extend(true, options.pugOptions, {data: {current: name}});
                callback(null, file);
            })), combine($.pug(options.pugOptions)))), pugFilter.restore,

            $.if(options.rigger, $.rigger()),

            $.if(options.sourcemaps, $.sourcemaps.write('.'))
        ).on('error', $.notify.onError());

        stream = stream.pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError())
            .pipe("writeHTMLHandler" in options ? options.writeHTMLHandler() : combine())
            .on('error', $.notify.onError());

        return stream;
    };
};