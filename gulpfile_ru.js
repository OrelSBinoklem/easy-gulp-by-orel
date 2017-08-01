'use strict';
const gulp = require('gulp');

//Понятия:
//Модуль - gulp модуль выполняющий задачи одного типа

//Есть 3 уровня опций:
//1. Глобальный который распространяеться на все задачи (задаёться в свойстве "general")
/*2. Для модуля задач одного типа (задаёться в свойстве general и свойстве с именем task_имя_задачи).
* Знак "•" в начале комментарий свойств обозначает те свойства которые управляют режимами работы задач или этого плагина (помечаються на том уровне на котором используються)
* Знак "&" означает что они общие для нескольких модулей и их лучше задавать на глобальном уровне.
* Знак "↓" означает что эти свойства рекомендуеться задавать отдельно для каждой конкретной задачи*/
//3. Локальные для каждой задачи (задаються в каждом обьекте в свойстве с именем модуля)

//Задачи задаються в свойствах имеющие имена модулей. Потдерживаемые модули: html, css, js, images, copy
//Есть 3 формата задания задач:
//1. Просто обьект с настройками если задача одна
//2. массиив объектов задач если надо разные файлы по разному обработать
/*3. Можно в массиве задач заместо объектов настроек передавать массивы объектов настроек связанных задач. Если определнные файлы были обработаны связанной задачей то в последующие связанные задачи в рамках одного массива они непопадут
* Запомните! Вначале надо определять задачи с более частными шаблонами файлов а потом с более общими, наподобие системы роутинга в php фреймворках. Потому что если передать
* в начале более общий шаблон то файлы всегда будут попадать в эту задачу и никогда непопадут в следующую задачу с более частным шаблоном*/

require('./index')(function(dev) {
return {
    general: {
        base_src: 'src',     //
        base_tmp: 'tmp',
        base_dest: 'public',

        clean: !dev,

        changed: dev,

        minification: !dev,
        sourcemaps: dev,

        //set 1 sec save if you use phpshtorm (File | Settings | Appearance and Behavior | System Settings | Save files automatically if application is idle for 1 sec)
        watch: dev,

        browserSync: dev,
        browserSyncOptions: {},

        adaptivePixelPerfect: dev,
        adaptivePixelPerfectOptions: {
            port: 3010,
            design: "design"
        },

        task_html: {
            includeHtml: true,
            includeHtmlOptions: {prefix: '@@', basepath: '@file'},
            pugData: "pug/data.json",
            pugOptions: {pretty: '\t'}
        },

        //https://github.com/ai/browserslist
        task_css: {
            autoprefixerOptions: {browsers: ['last 10 versions', "Firefox > 40"], cascade: false}
        },

        task_js: {
            coffeeOptions: {bare: true}
        },

        task_images: {
            //changed: true,                     // &(boolean: true|false,                 Def:true). Обрабатывать только те картинки которые изменились
            quality: "simple",                   //• (String: "perfect" | "good" | "simple" | "low", Def: "simple"). webp всеравно жмёться алгоритмом с потерями при "perfect" (решение автора плагина)
            webp: true,                          //• (boolean: true|false,                 Def:false). Все картинки дополнительно жмуться в формат webp и вставляються в ту же папку с такими же именами
            sprite: false,                       //•↓(boolean: true|false,                 Def:false). Просто жмём картинки или создаём спрайт. Вставьте в ваш .htaccess файл код с этой статьи: https://github.com/vincentorback/WebP-images-with-htaccess. Для потдержки webp
            dest: "",                            // ↓(String: "путь"                       Def: "" куда ложить картики или спрайты (относительно "base_dest")
            spriteOptions: {
                styleFormat: 'sass',             //  (String: "расширение файла"           Def: "sass"). Для препроцессора стилей в котором будут данные о спрайте
                destStyle: 'sass',               //  (String: "путь"                       Def: "sass"). для файла препроцессора стилей в котором будут данные о спрайте (относительно "base_tmp")
                relStyleToImg: '../img/sprites', //  (String: " относительный путь"         Def: ""). путь относительно откомпилированного файла стилей с данными о спрайте к картинке спрайту
                destExamples: 'sprite-examples', //  Папка в которую поместить полезные миксины и примеры вывода стилей и html для отдельных иконок из спрайтов. (относительно "base_tmp")
                png: {
                    prefixIcon: "icon-",         //  (String: "имя файла"                  Def: "icon__").Префикс к именам иконок спрайта - используеться в формировании классов стилей иконок
                    postfix2x: "@2x",            //• (Boolean: false | String: "имя файла" Def: false). Конец имени файлов с двойным разрешением для создания спрайта для ретины или 4k
                    name: 'sprite',              // ↓(String: "имя файла"                  Def: "sprite"). Картинка спрайта
                    styleName: '_png-sprite'     // ↓(String: "имя файла"                  Def: "_png-sprite"). Стили с данными об иконках спрайта
                },
                svg: {
                    prefixIcon: "icon-",         //  (String: "имя файла"                  Def: "svg-icon__").Префикс к именам иконок спрайта - используеться в формировании классов стилей иконок и идентификаторов в тегах symbol в svg
                    clearColor: false,           //• (boolean: true|false,                 Def:false). Удаление атрибутов цвета чтобы можно было цвет svg иконки задавать через свойство color в стилях
                    name: 'sprite',              // ↓(String: "имя файла"                  Def: "sprite"). Картинка спрайта
                    styleName: '_svg-sprite'     // ↓(String: "имя файла"                  Def: "_png-sprite"). Стили с данными об иконках спрайта
                }
            }
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