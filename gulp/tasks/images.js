'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const through2 = require("through2").obj;
const combine = require('stream-combiner2').obj;
const extend = require('extend');
const path = require('path');
const pathJoin = require('../path.join.js');
const buffer = require('vinyl-buffer');
const eventStream = require('event-stream');
const ignoreFiles = require("../ignore-files");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const spritesmith = require("gulp.spritesmith");
const cache = require('gulp-cache');

module.exports = function(options) {
    options = extend(true, {
        dest: "",
        changed: true,
        quality: "normal",
        qualityFolders: false,
        webp: false,
        sprite: false,
        spriteOptions: {
            styleFormat: 'sass',
            relStyleToImg: '',
            destStyle: 'sass',
            destExamples: 'sprite-examples',
            png: {
                styleName: '_png-sprite',
                postfix2x: false,
                prefixIcon: 'icon__',
                name: 'sprite' //параметр ненужен но будет ошибка если его незадать - если будут только svg картинки всёравно сработает код спрайтов для png
            },
            svg: {
                name: 'sprite',
                styleName: '_svg-sprite',
                prefixIcon: 'svg-icon__',
                clearColor: false
            }
        }
    }, options);

    var spriteOpt = options.spriteOptions;

    var dest = 'base_dest' in options ? pathJoin(options.base_dest, options.dest) : options.dest;

    var spritesmithOptions = {
        imgName: path.join(spriteOpt.relStyleToImg, spriteOpt.png.name + '.png').replace(/\\/gim, "/"),
        cssName: spriteOpt.png.styleName + '.' + spriteOpt.styleFormat,
        cssTemplate: __dirname + '/images/' + spriteOpt.styleFormat + (spriteOpt.png.postfix2x ? "_retina" : "") + '.template.handlebars',//scss - шаблон с map форматом использовать пока небудем
        cssVarMap: function (sprite) {
            sprite.name = spriteOpt.png.prefixIcon + sprite.name;
        },
        algorithm: 'binary-tree'
    };
    if(spriteOpt.png.postfix2x) {
        spritesmithOptions.retinaSrcFilter = '**/*' + spriteOpt.png.postfix2x + '.png';
        spritesmithOptions.retinaImgName = path.join(spriteOpt.relStyleToImg, spriteOpt.png.name + spriteOpt.png.postfix2x + '.png').replace(/\\/gim, "/");
    }

    var svgSpriteOptions = {
        shape: {
            id: {
                separator: '',
                generator: function(name, file) {
                    var pathArr = name.split(/[\\\/]/gim);
                    return spriteOpt.svg.prefixIcon + pathArr[pathArr.length - 1].replace(/\.\w{1,14}$/gim, "");
                }
            }
        },
        mode: {
            symbol: {
                sprite: path.join(spriteOpt.relStyleToImg, spriteOpt.svg.name + '.svg').replace(/\\/gim, "/"),
                render: {}
            }
        }
    };
    svgSpriteOptions.mode.symbol.render[spriteOpt.styleFormat] = {
        dest: spriteOpt.svg.styleName + '.' + spriteOpt.styleFormat,
        template: __dirname + '/images/svg_sprite_template.' + spriteOpt.styleFormat + '.handlebars'
    };

    var qualities = {
        perfect: {jpeg: {loops: 5, min: 100, max: 100}, png: '100-100', webp: {quality: 100, alphaQuality: 100}},
        good:    {jpeg: {loops: 5, min: 95,  max: 95},  png: '90-90',   webp: {quality: 95,  alphaQuality: 95}},
        normal:  {jpeg: {loops: 5, min: 90,  max: 90},  png: '70-70',   webp: {quality: 90,  alphaQuality: 90}},
        simple:  {jpeg: {loops: 5, min: 75,  max: 75},  png: '50-50',   webp: {quality: 75,  alphaQuality: 90}},
        low:     {jpeg: {loops: 5, min: 60,  max: 60},  png: '30-30',   webp: {quality: 60,  alphaQuality: 80}}
    };

    var qualityList;
    if(options.qualityFolders) {
        qualityList = ["perfect", "good", "normal", "simple", "low"];
    } else {
        qualityList = [options.quality];
    }

    return function(callback) {
        var cycleTasks = [];

        var stream_main = gulp.src(options.src)
            .pipe("ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine());

        if(options.qualityFolders) {
            var qualityStreams = {
                perfect: stream_main.pipe($.clone()).pipe($.filter('**/perfect/*.{jpg,png,gif,svg}')),
                good: stream_main.pipe($.clone()).pipe($.filter('**/good/*.{jpg,png,gif,svg}')),
                normal: stream_main.pipe($.clone()).pipe($.filter('**/normal/*.{jpg,png,gif,svg}')),
                simple: stream_main.pipe($.clone()).pipe($.filter('**/simple/*.{jpg,png,gif,svg}')),
                low: stream_main.pipe($.clone()).pipe($.filter('**/low/*.{jpg,png,gif,svg}'))
            }

            qualityStreams[options.quality] = eventStream.merge(qualityStreams[options.quality], stream_main.pipe($.filter(['**/*.{jpg,png,gif,svg}', '!**/{perfect,good,normal,simple,low}/*.{jpg,png,gif,svg}'])));
        }

        for(var quality in qualityList) {
            var jpegQuality = qualities[qualityList[quality]].jpeg;
            var pngQuality = qualities[qualityList[quality]].png;
            var webpQuality = qualities[qualityList[quality]].webp;

            if(options.qualityFolders) {
                stream_main = qualityStreams[qualityList[quality]];
            }

            var tasks = [];

            stream_main = stream_main.pipe(
                combine(
                    $.if(options.qualityFolders, through2(function(file, enc, callback){
                        file.path = file.path.replace(/(perfect|good|normal|simple|low)([\\\/]{1,2}[^\\\/]+)$/, "$2");
                        callback(null, file);
                    }))
                )
            );

            if(options.sprite) {
                //PNG sprite
                var spriteData = stream_main.pipe(combine(

                    $.clone(),

                    $.filter('**/*.png')

                ))
                    .on('error', $.notify.onError())
                    .pipe(spritesmith(spritesmithOptions));

                var stream_pngSprite = spriteData.img
                    .pipe(buffer())
                    .pipe(through2(function(file, enc, callback){
                        var pathArr = file.path.split(/[\\\/]/gim);
                        file.path = pathArr[pathArr.length - 1];

                        callback(null, file);
                    }));
                var stream_pngSpriteStyle = spriteData.css.pipe(gulp.dest('base_tmp' in options ? pathJoin(options.base_tmp, spriteOpt.destStyle) : spriteOpt.destStyle))
                    .pipe(through2(function(file, enc, callback){callback()}))
                    .on('error', $.notify.onError());

                //SVG sprite
                var stream_svg_sprite = stream_main.pipe(combine(

                    $.clone(),

                    $.filter('**/*.svg'),

                    $.if(spriteOpt.svg.clearColor, combine(
                        $.svgmin({
                            js2svg: {
                                pretty: true
                            }
                        }),

                        $.cheerio({
                            run: function ($) {
                                $('[fill]').removeAttr('fill');
                                $('[stroke]').removeAttr('stroke');
                                $('[style]').removeAttr('style');
                            },
                            parserOptions: {xmlMode: true}
                        }),

                        $.replace('&gt;', '>')
                    )),

                    $.svgSprite(svgSpriteOptions),

                    through2(function(file, enc, callback){
                        var pathArr = file.path.split(/[\\\/]/gim);
                        file.path = pathArr[pathArr.length - 1];
                        callback(null, file);
                    })

                ).on('error', $.notify.onError()));
                stream_svg_sprite = stream_svg_sprite
                    .pipe($.if('**/*.{sass,scss,less,styl}', combine(
                        gulp.dest('base_tmp' in options ? pathJoin(options.base_tmp, spriteOpt.destStyle) : spriteOpt.destStyle),
                        through2(function(file, enc, callback){callback()})
                    )))
                    .on('error', $.notify.onError());

                stream_main = eventStream.merge(stream_pngSprite, stream_pngSpriteStyle);

                if(spriteOpt.destExamples) {
                    var stream_examples_sprite = gulp.src(__dirname + '/images/_example_*.*')
                        .pipe($.changed('base_tmp' in options ? pathJoin(options.base_tmp, spriteOpt.destExamples) : spriteOpt.destExamples))
                        .pipe(gulp.dest('base_tmp' in options ? pathJoin(options.base_tmp, spriteOpt.destExamples) : spriteOpt.destExamples));
                }
            }

            //images compress
            var stream_compress = stream_main.pipe(combine(

                $.clone(),

                $.if(options.changed && !options.sprite, $.changed(dest)),

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

            ).on('error', $.notify.onError("Error: <%= error.message %>")));

            if(options.webp) {
                var stream_webp = stream_main.pipe(combine(

                    $.clone(),

                    $.filter('**/*.{jpg,jpeg,png}'),

                    $.if(options.changed && !options.sprite, $.changed(dest, {extension: '.webp'})),

                    $.webp(webpQuality)

                ).on('error', $.notify.onError("Error: <%= error.message %>")));
            }

            tasks.push(stream_compress);
            if(options.webp){tasks.push(stream_webp)}
            if(options.sprite){tasks.push(stream_svg_sprite)}

            tasks.forEach(function(el) {
                el.pipe(gulp.dest(dest))
                    .on('error', $.notify.onError("Error: <%= error.message %>"))
                    .pipe("writeImgStream" in options ? options.writeImgStream() : combine())
                    .on('error', $.notify.onError("Error: <%= error.message %>"));
            });

            if(options.sprite && spriteOpt.destExamples){tasks.push(stream_examples_sprite)}

            cycleTasks = cycleTasks.concat(tasks);
        }

        eventStream.merge(cycleTasks).on('end', callback);
    };

};