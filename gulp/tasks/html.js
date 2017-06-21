'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combine = require('stream-combiner2').obj;
const extend = require('extend');
const pathJoin = require('../path.join.js');
const ignoreFiles = require("../ignore-files");

module.exports = function(options) {

    options = extend(true, {
        sourcemaps: false,
        pug: false,
        dest: "",
        pugOptions: {
            pretty: '\t'
        }
    }, options);

    if(!("data" in options.pugOptions) && "pugData" in options && !!options.pugData) {
        options.pugOptions.data = require('base_src' in options ? pathJoin(process.cwd(), options.base_src, options.pugData) : pathJoin(process.cwd(), options.pugData));
    }

    return function() {
        var stream = combine(
            gulp.src(options.src),

            $.if("ignoreFiles" in options, ignoreFiles.stream(options.ignoreFiles)),

            //$.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest, {extension: '.html'}),//решить проблему с редактированием .json и посмотреть что в стилях происходит меняетья файл если редактировать подключаемый файл

            $.if(options.sourcemaps, $.sourcemaps.init()),

            $.if(options.pug, $.pug(options.pugOptions)),

            $.if(options.sourcemaps, $.sourcemaps.write('.'))
        ).on('error', $.notify.onError());

        stream.pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError());

        if("writeHTMLHandler" in options) {
            stream.pipe(options.writeHTMLHandler({stream: true}))
                .on('error', $.notify.onError());
        }

        return stream;
    };

};