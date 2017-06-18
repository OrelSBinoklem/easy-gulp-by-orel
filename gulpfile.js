'use strict';
const gulp = require('gulp');

//Можно в 1 модуль передать несколько задач в виде массива

require('./index')(function(dev) {
    return {
        general: {
            base_src: 'src',
            base_dest: 'public',

            clean: false,//ВРЕМЕННО

            minification: !dev,
            sourcemaps: dev,

            watch: dev,

            browserSync: dev,
            browserSyncOptions: {},

            adaptivePixelPerfect: dev,
            adaptivePixelPerfectOptions: {
                port: 3010,
                design: "design"
            }
        },

        //sass, scss, less, styl, css
        styles: [
            [
                {name: 'sass2', src: 'sass/**/case-dostaevsky.sass', dest: 'styles2', autoprefixer: true, disabled: false},
                {name: 'sass', src: 'sass/**/*.sass', dest: 'styles', autoprefixer: true, disabled: false}
            ]
        ]
    };
});

gulp.task('default', ['easy:gulp:by:orel']);
gulp.task('production', ['easy:gulp:by:orel:production']);