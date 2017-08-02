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
        quality: "simple",
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

    return function(callback) {
        var tasks = [];
        var stream_main = gulp.src(options.src)
            .pipe("ignoreFiles" in options ? ignoreFiles.stream(options.ignoreFiles) : combine());

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

            stream_main = $.merge(stream_pngSprite, stream_pngSpriteStyle);

            if(spriteOpt.destExamples) {
                var stream_examples_sprite = gulp.src(__dirname + '/images/_example_*.*')
                    .pipe($.changed('base_tmp' in options ? pathJoin(options.base_tmp, spriteOpt.destExamples) : spriteOpt.destExamples))
                    .pipe(gulp.dest('base_tmp' in options ? pathJoin(options.base_tmp, spriteOpt.destExamples) : spriteOpt.destExamples));
            }
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

        ).on('error', $.notify.onError("Error: <%= error.message %>")));

        if(options.webp) {
            var stream_webp = stream_main.pipe(combine(

                $.clone(),

                $.filter('**/*.{jpg,jpeg,png}'),

                $.if(options.changed, $.changed(dest, {extension: '.webp'})),

                $.webp(webpQuality)

            ).on('error', $.notify.onError("Error: <%= error.message %>")));
        }

        tasks.push(stream_compress);
        if(options.webp){tasks.push(stream_webp)}
        if(options.sprite){tasks.push(stream_svg_sprite)}
        if(options.sprite && options.spriteOpt.destExamples){tasks.push(stream_examples_sprite)}

        tasks.forEach(function(el) {
            el.pipe(gulp.dest(dest))
                .on('error', $.notify.onError("Error: <%= error.message %>"))
                .pipe("writeImgStream" in options ? options.writeImgStream() : combine())
                .on('error', $.notify.onError("Error: <%= error.message %>"));
        });

        eventStream.merge(tasks).on('end', callback);
    };

};