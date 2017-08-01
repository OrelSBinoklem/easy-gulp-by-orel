'use strict';
const gulp = require('gulp');

//Можно в 1 модуль передать несколько задач в виде массива
//Можно в массиве задач передать массив связанных задач. Если определнные файлы были обработаны задачей то в последующие задачи они непопадут (даже если соответствуют шаблону src)
//Запомните! Вначале надо определять задачи с более частными шаблонами файлов а потом с более общими, наподобие системы роутинга в php фреймворках. Потому что если передать
//в начале более общий шаблон то файлы всегда будут попадать в эту задачу и никогда непопадут в следующую задачу с более частным шаблоном

require('./index')(function(dev) {
return {
    general: {
        base_src: 'src',
        base_tmp: 'tmp',
        base_dest: 'public',

        clean: !dev,

        changed: dev,

        minification: !dev,
        sourcemaps: dev,

        //Общее для html
        includeHtml: true,
        includeHtmlOptions: {prefix: '@@', basepath: '@file'},
        pugData: "pug/data.json",
        pugOptions: {pretty: '\t'},

        //Общее для css
        //https://github.com/ai/browserslist
        autoprefixerOptions: {browsers: ['last 10 versions', "Firefox > 40"], cascade: false},

        //Общее для js
        coffeeOptions: {bare: true},

        //Общее для картинок
        //please insert your .htaccess file this code https://github.com/vincentorback/WebP-images-with-htaccess (for support webp)
        //Examples of using sprites will be in the folder "tmp/sprite-examples". css preprocessors and pug for svg icons
        quality: "simple",                   //(String: "perfect" | "good" | "simple" | "low", Def: "simple")
        webp: true,                          //(boolean: true|false,                           Def:false) All the pictures are compressed in the format of webp
        spriteOptions: {
            styleFormat: 'sass',             //Format styles with data about the sprite
            destStyle: 'sass',
            relStyleToImg: '../img/sprites',
            destExamples: 'sprite-examples',
            png: {
                prefixIcon: "icon-",
                postfix2x: "@2x"
            },
            svg: {
                prefixIcon: "icon-"
            }
        },

        //set 1 sec save if you use phpshtorm (File | Settings | Appearance and Behavior | System Settings | Save files automatically if application is idle for 1 sec)
        watch: dev,

        browserSync: dev,
        browserSyncOptions: {},

        adaptivePixelPerfect: dev,
        adaptivePixelPerfectOptions: {
            port: 3010,
            design: "design"
        }
    },

    //support pug
    //Instal "Pug (ex-Jade)" plugin if you use phpshtorm
    html: [
        [
            {name: 'pug', src: ['*.pug'], addWatch: ['pug/**/*.pug', "pug/data.json"], sourcemaps: false},
            {name: 'html', src: ['/**/*.{html,htm}'], sourcemaps: false}
        ]
    ],

    //sass, scss, less, styl, css
    css: [
        [
            {name: 'sass2', src: ['sass/**/case-dostaevsky.sass', 'sass/**/case-help-to-mama.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css', autoprefixer: true, disabled: false},
            {name: 'sass', src: ['sass/*.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css', autoprefixer: true, disabled: false}
        ],
        {name: 'css', src: ['/**/*.css'], autoprefixer: true}
    ],

    //support coffee
    js: [
        {name: 'coffee', src: 'coffee/*.coffee', addWatch: "coffee/**/*.coffee", dest: 'js'},
        {name: 'js', src: '/**/*.js'}
    ],

    //support compress jpg, png, gif, svg, webp
    //quality: "perfect", "good", "simple", "low". default: "simple"
    //styleFormat: sass, scss, less, styl
    //SVG - http://glivera-team.github.io/svg/2016/06/13/svg-sprites-2.html
    //SVG - not support js manipulation this mode (https://github.com/jonathantneal/svg4everybody)
    //SVG - http://savvateev.org/blog/54/
    //png2x: "-2x" support problem
    images: [
        [
            //pngStyle вернуть нижнее подчеркивание
            {name: 'images-sprites', src: ['img/sprite/**/*.{png,svg}'], quality: "good", dest: 'img/sprites', sprite: true,
                spriteOptions:{
                    png: {name: 'sprite', styleName: '_png-sprite'},
                    svg: {name: 'sprite', styleName: '_svg-sprite'}}},
            {name: 'images', src: ['/**/*.{jpg,jpeg,png,gif,svg}']}
        ]
    ],

    copy: {name: 'copy', src: ['/**/*.{webp,ico,otf,eot,ttf,woff,woff2}']}
};
});

gulp.task('default', ['easy:gulp:by:orel']);
gulp.task('production', ['easy:gulp:by:orel:production']);