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
            base_dest: 'public',

            clean: false,//ВРЕМЕННО

            minification: !dev,
            sourcemaps: dev,
            pugData: "pug/data.json",
            pugOptions: {pretty: '\t'},
            autoprefixerOptions: {browsers: ['last 10 versions', "Firefox > 40"], cascade: false},
            coffeeOptions: {bare: true},

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
                {name: 'pug', src: ['*.pug'], addWatch: 'pug/**/*.pug', sourcemaps: false},
                {name: 'html', src: ['/**/*.{html,htm}'], sourcemaps: false}
            ]
        ],

        //sass, scss, less, styl, css
        css: [
            [
                {name: 'sass2', src: ['sass/**/case-dostaevsky.sass', 'sass/**/case-help-to-mama.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css', autoprefixer: true, disabled: false},
                {name: 'sass', src: ['sass/**/*.sass', "!sass/**/{constant,footer,header,mixing}.sass"], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css', autoprefixer: true, disabled: false}
            ],
            {name: 'css', src: ['/**/*.css'], autoprefixer: true}
        ],

        //support coffee
        js: [
            {name: 'coffee', src: 'coffee/*.coffee', addWatch: "coffee/**/*.coffee", dest: 'js'},
            {name: 'js', src: '/**/*.js'}
        ],

        copy: {name: 'copy', src: ['/**/*.{jpg,png,gif,svg,webp,ico,otf,eot,ttf,woff,woff2}']}
    };
});

gulp.task('default', ['easy:gulp:by:orel']);
gulp.task('production', ['easy:gulp:by:orel:production']);