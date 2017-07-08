'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combine = require('stream-combiner2').obj;
const extend = require('extend');
const pathJoin = require('../path.join.js');
const ignoreFiles = require("../ignore-files");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const cache = require('gulp-cache');

module.exports = function(options) {

    options = extend(true, {
        dest: "",
        changed: true,
        quality: "simple",//"perfect", "good", "simple", "low"
        sprite: false
    }, options);

    var jpegQuality, pngQuality, webpQuality;
    switch (options.quality) {
        case 'perfect':
            jpegQuality = {loops: 5, min: 100, max: 100};
            pngQuality = '100-100';
            webpQuality = {quality: 100, alphaQuality: 100};
            break;
        case 'good':
            jpegQuality = {loops: 5, min: 95, max: 95};
            pngQuality = '90-90';
            webpQuality = {quality: 95, alphaQuality: 95};
            break;
        case 'simple':
            jpegQuality = {loops: 5, min: 90, max: 90};
            pngQuality = '70-70';
            webpQuality = {quality: 90, alphaQuality: 90};
            break;
        case 'low':
            jpegQuality = {loops: 5, min: 75, max: 75};
            pngQuality = '50-50';
            webpQuality = {quality: 75, alphaQuality: 90};
            break;
    }

    return function() {
        var stream_src = gulp.src(options.src)
            .pipe("ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine());

        var stream_main = stream_src.pipe(combine(

            $.clone(),

            $.if(options.changed, $.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest)),

            gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest),//fix bug for not save unoptimized images

            $.imagemin([
                $.imagemin.gifsicle({interlaced: true}),
                $.imagemin.jpegtran({progressive: true}),
                imageminJpegRecompress(jpegQuality),
                $.imagemin.svgo(),
                $.imagemin.optipng({optimizationLevel: 3}),
                pngquant({quality: pngQuality, speed: 5})
            ], {
                verbose: true
            })

        ).on('error', $.notify.onError()));

        stream_main = stream_main.pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError());

        if(options.webp === true) {
            var stream_webp = stream_src.pipe(combine(

                $.clone(),

                $.if(options.changed, $.changed('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest, {extension: '.webp'})),

                $.filter('**/*.{jpg,jpeg,png}'),

                $.webp(webpQuality)

            ).on('error', $.notify.onError()));
        }

        var stream_merged = (options.webp === true ? $.merge(stream_main, stream_webp) : stream_main)
            .pipe(gulp.dest('base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest))
            .on('error', $.notify.onError())
            .pipe("writeImgStream" in options ? options.writeImgStream() : combine())
            .on('error', $.notify.onError());

        return stream_merged;
    };

};