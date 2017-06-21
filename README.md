Tuned gulp for frontend

## Install

```bash
$ npm i easy-gulp-by-orel --save-dev
```

## Usage
```js
'use strict';
const gulp = require('gulp');

//Можно в 1 модуль передать несколько задач в виде массива

require('easy-gulp-by-orel')(function(dev) {
    return {
        general: {
            base_src: 'src',
            base_dest: 'public',

            clean: !dev,

            minification: !dev,
            sourcemaps: dev,
            pug: true,
            pugData: "data.json",
            pugOptions: {pretty: '\t'},

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
        ],

        //support jade
        //Instal "Pug (ex-Jade)" plugin if you use phpshtorm
        html: [
            [
                {name: 'templates', src: ['*.pug']}
            ]
        ]
    };
});

gulp.task('default', ['easy:gulp:by:orel']);
gulp.task('production', ['easy:gulp:by:orel:production']);
```

## Release Notes

| Release | Notes |
| --- | --- |
| 0.0.2 | Added addWatch and took into account the exclusion of files in dependent tasks, add PUG |
| 0.0.1 | Add two level array related tasks (ignore files before tasks) |
| 0.0.0 | Pre alpha release |

## Licence

MIT
<!-- do not want to make nodeinit to complicated, you can edit this whenever you want. -->