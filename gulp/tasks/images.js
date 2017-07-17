'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const through2 = require("through2").obj;
const combine = require('stream-combiner2').obj;
const extend = require('extend');
const path = require('path');
const pathJoin = require('../path.join.js');
const buffer = require('vinyl-buffer');
const ignoreFiles = require("../ignore-files");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const spritesmith = require("gulp.spritesmith");
const cache = require('gulp-cache');

module.exports = function(options) {

    options = extend(true, {
        dest: "",
        changed: true,
        quality: "simple",//"perfect", "good", "simple", "low"
        webp: false,
        sprite: false,
        styleFormat: 'sass',
        relStyleToImg: '',
        pngName: 'sprite',//параметр ненужен но будет ошибка если его незадать - если будут только svg картинки всёравно сработает код спрайтов для png
        png2x: false,
        pngStyle: '_png-sprite',
        prefixIcon: 'icon',
        destStyle: '.'
    }, options);

    var dest = 'base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest;

    var spritesmithOptions = {
        imgName: path.join(options.relStyleToImg, options.pngName + '.png').replace(/\\/gim, "/"),
        cssName: options.pngStyle + '.' + options.styleFormat,
        cssTemplate: __dirname + '/images/' + options.styleFormat + (options.png2x ? "_retina" : "") + '.template.handlebars',//scss - шаблон с map форматом использовать пока небудем
        cssVarMap: function (sprite) {
            sprite.name = options.prefixIcon + '-' + sprite.name;
        },
        algorithm: 'binary-tree'
    };
    if(options.png2x) {
        spritesmithOptions.retinaSrcFilter = '**/*' + options.png2x + '.png';
        spritesmithOptions.retinaImgName = path.join(options.relStyleToImg, options.pngName + options.png2x + '.png').replace(/\\/gim, "/");
    }

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
        var stream_main = gulp.src(options.src)
            .pipe("ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine());

        //PNG sprite
        if(options.sprite) {
            var spriteData = stream_main
                .pipe($.clone()).on('error', $.notify.onError())
                .pipe($.filter('**/*.png')).on('error', $.notify.onError())
                .pipe(spritesmith(spritesmithOptions));


            var stream_pngSprite = spriteData.img
                .pipe(buffer())
                .pipe(through2(function(file, enc, callback){
                    var pathArr = file.path.split(/[\\\/]/gim);
                    file.path = pathArr[pathArr.length - 1];
                    callback(null, file);
                }));
            spriteData.css.pipe(gulp.dest('base_src' in options ? pathJoin(options.base_src, options.destStyle) : options.destStyle));

            //SVG sprite

            stream_main = stream_pngSprite;
        }

        //images compress
        var stream_compress = stream_main.pipe(combine(

            $.clone(),

            $.if(options.changed, $.changed(dest)),

            gulp.dest(dest),//fix bug for not save unoptimized images

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

        ).on('error', $.notify.onError("Error: <%= error.message %> 113")));

        if(options.webp) {
            var stream_webp = stream_main.pipe(combine(

                $.clone(),

                $.filter('**/*.{jpg,jpeg,png}'),

                $.if(options.changed, $.changed(dest, {extension: '.webp'})),

                $.webp(webpQuality)

            ).on('error', $.notify.onError("Error: <%= error.message %> 121")));
        }

        var stream_merged = (options.webp ? $.merge(stream_compress, stream_webp) : stream_compress)
            .pipe(gulp.dest(dest))
            .on('error', $.notify.onError("Error: <%= error.message %> 126"))
            .pipe("writeImgStream" in options ? options.writeImgStream() : combine())
            .on('error', $.notify.onError("Error: <%= error.message %> 128"));

        return stream_merged;
    };

};