Tuned gulp for frontend

## Install

```bash
$ npm i easy-gulp-by-orel --save-dev
```

## Usage
```js
'use strict';
const gulp = require('gulp');

//Concepts:
//Module - gulp module that performs tasks of the same type

//If the variable dev = true, then this is development and if false then the production

//There are 5 types of options:
//1. The global one that propagates to all tasks (set in the "general" property)
//2. For modules working at the level of the entire application (set in the "common_modules" property)
//3. For all regular modules (set in the "all_casual_modules" property)
/*4. Module tasks of the same type (set in casual_modules property and property with the name of the module).
 * The sign "•" at the beginning of the properties comment denotes those properties that control the modes of operation of tasks or this plugin (marked at the level on which to use)
 * The "&" sign means that they are common for several modules and they are best set in "all_casual_modules" or "general".
 * The sign "↓" means that these properties are recommended to be set separately for each specific task
//5. For each casual task (set by objects in the property with the module name)

//Tasks are defined in properties that have module names. Supported modules: html, css, js, images, copy
//There are 3 formats for assigning tasks:
//1. Just an object with settings if the task is one
//2. Array of task objects if you need to process different files differently
/*3. You can transfer arrays of the settings of related tasks in the array of tasks instead of the configuration objects. If certain files have been processed by a related task, then in subsequent related tasks within the same array they will not fall
 * Remember! First, you need to define tasks with more specific file templates and then with more general ones, like the routing system in php frameworks. Because if you pass
 * in the beginning a more general template, then the files will always fall into this task and will never fall into the next task with a more private template*/

require('./index')(function(dev) {
return {
    general: {
        base_src: 'src',              // (String: "путь"       Def:"."). Base path to the source files
        base_tmp: 'tmp',              // (String: "путь"       Def:"."). Base path to the temporary files folder
        base_dest: 'public',          // (String: "путь"       Def:"."). Base path to the folder with the end result

        //Set the saving every 1 sec if you use the phpshtorm editor (File | Settings | Appearance and Behavior | System Settings | Save files automatically if application is idle for 1 sec)
        watch: dev                    //• (boolean: true|false, Def:false). Monitor file changes and recompile on the fly.
    },

    common_modules: {
        clean: !dev,                  //• (boolean: true|false, Def:false). Destroys the folders "base_tmp", "base_dest" before running the main tasks

        browserSync: dev,             //• (boolean: true|false, Def:false). Updates on the fly the layout in the browser if the files have changed. Synchronizes actions in several browsers, which allows you to test the layout simultaneously in several browsers. Allows you to test the layout on mobile via WIFI
        browserSyncOptions: {},       //  (object: for browser-sync plugin, Def:notdocumented). By default, different options are set for different settings

        adaptivePixelPerfect: dev,    //• (boolean: true|false, Def:false). Emulates the layout at different resolutions and puts under it a design image corresponding to this resolution. Synchronizes actions in several browsers, which allows you to test the layout simultaneously in several browsers. So far, it does not allow to test the layout on mobile via WIFI !!!
        adaptivePixelPerfectOptions: {
            port: 3010,               //  (int: \d{4},          Def:3010). The port on which to create an alternative plug-in page in addition to browser-sync
            design: "design"          //  (String: "path"       Def:"design"). The path to the folder with the pictures of the design
        }
    },

    all_casual_modules: {
        changed: dev,                //• (boolean: true|false, Notdef). Process only those files that have changed
        minification: !dev,          //• (boolean: true|false, Notdef). Minification of files
        sourcemaps: dev              //• (boolean: true|false, Notdef). Sourcemaps files
    },

    //All modules have the following options:
        //watch             //• (boolean: true|false, Def:false). Monitor file changes and recompile on the fly.
        //name              // ↓(String: "task name"  Notdef)
        //src               // ↓(minimatch patterns   Notdef). Where to get files (relative to "base_src").
        //dest              // ↓(String: "path"       Def: ""). Where to put html (relative to "base_dest")
        //addWatch          // ↓(Boolean: false | String: "path" Def: false). Adds files to the monitoring. When changing files, it simply performs the task without processing these files (relative to "base_src")
        //disabled          //•↓(boolean: true|false | String: "files-consider", Def:false). Cancels the task - you may need to use the variable dev - if you want the files in the dependent tasks to be considered and not to be allowed as when the mode is on, then pass the line "files-consider"

    casual_modules: {
        //Supported formats: html, htm, pug
        html: {
            seedingData: "seeding-data.json", //  (Boolean: false | String: "path" Def:false). Json file in which the auxiliary content data is stored for example: the text of the names of the links and / or the text of the posts. This data will be transferred to all pug and (html processed by the module gulp-file-include) files ... (relative to "base_src").
            fileInclude: false,       //•↓(boolean: true|false, Def:false). A plugin that simply connects one html files (with frequently used parts of the code, for example, header and footer) to the processed
            fileIncludeOptions: {     // ↓(object: for gulp-file-include plugin Def:{prefix: '@@', basepath: '@file'}).
                prefix: '@@',         //  (String:              Def: "@@"). Prefix before include, example: @@include('./header.html')
                basepath: '@file'     //  (String: "relative path" Def: "@file"). Regarding what to look for the attached file. Default: relative to the current file being processed
            },
            pug: true,                //•↓(boolean: true|false, Def:true). Enable pug. Set the "Pug (ex-Jade)" plugin if you are using the phpshtorm editor
            pugOptions: {
                pretty: '\t'          //  (String:              Def: "\t"). What indents should be nested tags when compiling in html. Default: tab
            },
            //changed: true,          // &(boolean: true|false, Def:true). Process only those files that have changed
            sourcemaps: false         // &(boolean: true|false, Def:false). Sourcemaps files
        },

        //Supported formats: sass, scss, less, styl, css
        css: {
            autoprefixer: true,       //• (boolean: true|false, true). Vendor prefixes, so that more browsers use modern chips even though sometimes with small bugs. For example -webkit-transition:
            autoprefixerOptions: {    //  (object: for gulp-autoprefixer plugin Def:{browsers: ['last 2 versions'], cascade: false}). See details here: //https://github.com/ai/browserslist
                browsers: ['last 10 versions', "Firefox > 40"],
                cascade: false
            }
            //changed: true,          // &(boolean: true|false, Def:true). Process only those files that have changed
            //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
            //minification: true      //  (boolean: true|false, true). Минификация files
        },

        //Supported formats: js, coffee
        js: {
            coffeeOptions: {          //• (object: for gulp-coffee plugin, Def:{bare: true}).
                bare: true
            }
            //changed: true,          // &(boolean: true|false, Def:true). Process only those files that have changed
            //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
            //minification: true      //  (boolean: true|false, true). Минификация files
        },

        //Supported formats: jpg, png, gif, svg
        //The webp is still compressed by the lossy algorithm with "perfect" (the plugin author's solution)
        //This method of creating the svg sprite is based on - http://glivera-team.github.io/svg/2016/06/13/svg-sprites-2.html. In this method, you can not manage icons through js, if you need it then embed images into html. To better support older browsers (https://github.com/jonathantneal/svg4everybody)
        //Display svg icons in Windows Explorer - http://savvateev.org/blog/54/
        images: {
            //changed: true,          // &(boolean: true|false,                 Def:true). Process only those files that have changed
            quality: "simple",        //• (String: "perfect" | "good" | "simple" | "low", Def: "simple").
            webp: true,               //• (boolean: true|false,                 Def:false). All the pictures are additionally hammered into the webp format and inserted into the same folder with the same names. Insert the code from this article into your .htaccess file: https://github.com/vincentorback/WebP-images-with-htaccess. For webp support
            sprite: false,            //•↓(boolean: true|false,                 Def:false). Just click the pictures or create a sprite.
            spriteOptions: {
                styleFormat: 'sass',             //  (String: "file extension"             Def: "sass"). For the preprocessor of styles in which there will be data about the sprite
                destStyle: 'sass',               //  (String: "path"                       Def: "sass"). For a preprocessor style file in which there will be data about sprite (relative to "base_tmp")
                relStyleToImg: '../img/sprites', //  (String: "relative path"         Def: ""). The path to the compiled style file with the data about the sprite
                destExamples: 'sprite-examples', //  (Boolean: false | String: "path"      Def: "sprite-examples"). A folder in which to put useful mixins and examples of outputting styles and html for individual icons from sprites. (Relative to "base_tmp")
                png: {
                    prefixIcon: "icon-",         //  (String: "file name"                  Def: "icon__"). The prefix to the names of the sprite icons is used in the formation of icon style classes
                    postfix2x: "@2x",            //• (Boolean: false | String: "file name" Def: false). End of file name with double resolution to create a sprite for retina or 4k. "-2x" with such a line there are bugs!!!
                    name: 'sprite',              // ↓(String: "file name"                  Def: "sprite"). Picture of the sprite
                    styleName: '_png-sprite'     // ↓(String: "file name"                  Def: "_png-sprite"). Styles with information about the icons of the sprite
                },
                svg: {
                    prefixIcon: "icon-",         //  (String: "file name"                  Def: "svg-icon__"). The prefix to the names of the sprite icons is used in the formation of icon style classes and identifiers in the symbol tags in svg
                    clearColor: false,           //• (boolean: true|false,                 Def:false). Removing the color attributes so that the color of the svg icons can be set via the color property in styles
                    name: 'sprite',              // ↓(String: "file name"                  Def: "sprite"). Picture of the sprite
                    styleName: '_svg-sprite'     // ↓(String: "file name"                  Def: "_png-sprite"). Styles with information about the icons of the sprite
                }
            }
        }
    },

    html: [
        [
            {name: 'pug', src: ['*.pug'], addWatch: ['pug/**/*.pug', "pug/data.json"], sourcemaps: false},
            {name: 'html', src: ['/**/*.{html,htm}'], sourcemaps: false}
        ]
    ],

    css: [
        [
            {name: 'sass2', src: ['sass/**/case-dostaevsky.sass', 'sass/**/case-help-to-mama.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css'},
            {name: 'sass', src: ['sass/*.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css'}
        ],
        {name: 'css', src: ['/**/*.css'], autoprefixer: true}
    ],

    js: [
        {name: 'coffee', src: 'coffee/*.coffee', addWatch: "coffee/**/*.coffee", dest: 'js'},
        {name: 'js', src: '/**/*.js'}
    ],

    images: [
        [
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
```
## Russian comments (original)
```js
'use strict';
const gulp = require('gulp');

//Понятия:
//Модуль - gulp модуль выполняющий задачи одного типа

//Если переменная dev = true то это разработка а если false то продакшин

//Есть 5 типов опций:
//1. Глобальный который распространяеться на все задачи (задаёться в свойстве "general")
//2. Для модулей работающих на уровне всего приложения (задаються в свойстве "common_modules")
//3. Для всех обычных модулей (задаються в свойстве "all_casual_modules")
/*4. Для модуля задач одного типа (задаёться в свойстве casual_modules и свойстве с именем модуля).
* Знак "•" в начале комментарий свойств обозначает те свойства которые управляют режимами работы задач или этого плагина (помечаються на том уровне на котором используються)
* Знак "&" означает что они общие для нескольких модулей и их лучше задавать в "all_casual_modules" или "general".
* Знак "↓" означает что эти свойства рекомендуеться задавать отдельно для каждой конкретной задачи*/
//5. Для каждой обычной задачи (задаються объектами в свойстве с именем модуля)

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
        base_src: 'src',              // (String: "путь"       Def:"."). Базовый путь к папке с исходниками
        base_tmp: 'tmp',              // (String: "путь"       Def:"."). Базовый путь к папке с временными файлами
        base_dest: 'public',          // (String: "путь"       Def:"."). Базовый путь к папке с конечным результатом

        //Установите сохранение каждую 1 сек, если пользуетесь редактором phpshtorm (File | Settings | Appearance and Behavior | System Settings | Save files automatically if application is idle for 1 sec)
        watch: dev                    //• (boolean: true|false, Def:false). Наблюдение за изменениями файлов и перекомпиляция на лету.
    },

    common_modules: {
        clean: !dev,                  //• (boolean: true|false, Def:false). Уничтожает папки "base_tmp", "base_dest" перед запуском основных задач

        browserSync: dev,             //• (boolean: true|false, Def:false). Обновляет на лету вёрстку в браузере если изменились файлы. Синхронизирует действия в нескольких браузерах, что позволяет тестировать вёрстку одновременно в нескольких браузерах. Позволяет тестировать вёрстку на мобильных через WIFI
        browserSyncOptions: {},       //  (object: for browser-sync plugin, Def:notdocumented). По умолчанию задаються разные опции при разных настройках

        adaptivePixelPerfect: dev,    //• (boolean: true|false, Def:false). Эмулирает вёрстку при разных разрешениях и подкладывает под неё картинку дизайна соответствующую этому разрешению. Синхронизирует действия в нескольких браузерах, что позволяет тестировать вёрстку одновременно в нескольких браузерах. Пока что не позволяет тестировать вёрстку на мобильных через WIFI!!!
        adaptivePixelPerfectOptions: {
            port: 3010,               // (int: \d{4},          Def:3010). Порт по которому создаёться альтернативная страница плагина помимо browser-sync
            design: "design"          // (String: "путь"       Def:"design"). Путь к папке с картинками дизайна
        }
    },

    all_casual_modules: {
        changed: dev,                //• (boolean: true|false, Notdef). Обрабатывать только те файлы которые изменились
        minification: !dev,          //• (boolean: true|false, Notdef). Минификация файлов
        sourcemaps: dev              //• (boolean: true|false, Notdef). Sourcemaps файлы
    },

    //У всех модулей есть следующие опции:
        //watch             //• (boolean: true|false, Def:false). Наблюдение за изменениями файлов и перекомпиляция на лету.
        //name              // ↓(String: "имя задачи" Notdef)
        //src               // ↓(minimatch patterns   Notdef). Откуда брать файлы (относительно "base_src").
        //dest              // ↓(String: "путь"       Def: ""). Куда ложить html (относительно "base_dest")
        //addWatch          // ↓(Boolean: false | String: "путь" Def: false). Добавляет в наблюдение файлы. При изменении файлов просто выполняет задачу без обработки этих файлов (относительно "base_src")
        //disabled          //•↓(boolean: true|false | String: "files-consider", Def:false). Отменяет задачу - возможно понадобиться с использованием переменной dev - если хотите чтоб в зависимых задачах файлы учитывались и непропускались как при включённом режиме то передайте строку "files-consider"

    casual_modules: {
        //Потдерживаються форматы: html, htm, pug
        html: {
            seedingData: "seeding-data.json", //  (Boolean: false | String: "путь" Def:false). json файл в котором храняться вспомогательные контентные данные например: текст имён ссылок и/или текст постов. Эти данные будут переданы во все pug и (html обрабатываемые модулем gulp-file-include) файлы... (относительно "base_src").
            fileInclude: false,       //•↓(boolean: true|false, Def:false). Плагин который просто подключает одни html файлы (с часто используемыми частями кода, например header и footer) в обрабатываемый
            fileIncludeOptions: {     // ↓(object: for gulp-file-include plugin Def:{prefix: '@@', basepath: '@file'}).
                prefix: '@@',         //  (String:              Def: "@@"). Префикс перед include, пример: @@include('./header.html')
                basepath: '@file'     //  (String: "относительный путь" Def: "@file"). Относительно чего искать подключаемый файл. По умолчанию: относительно текущего обрабатываемого файла
            },
            pug: true,                //•↓(boolean: true|false, Def:true). Включить pug. Установите "Pug (ex-Jade)" плагин если используете редактор phpshtorm
            pugOptions: {
                pretty: '\t'          //  (String:              Def: "\t"). Какими отступами должны делаться вложенные теги при компиляции в html. По умолчанию: табуляция
            },
            //changed: true,          // &(boolean: true|false, Def:true). Обрабатывать только те файлы которые изменились
            sourcemaps: false         // &(boolean: true|false, Def:false). Sourcemaps файлы
        },

        //Потдерживаються форматы: sass, scss, less, styl, css
        css: {
            autoprefixer: true,       //• (boolean: true|false, true). Вендорные префиксы, чтобы больше браузеров использовали современные фишки пускай даже иногда с небольшими багами. Например -webkit-transition:
            autoprefixerOptions: {    //  (object: for gulp-autoprefixer plugin Def:{browsers: ['last 2 versions'], cascade: false}). Смотрите подробно тут: //https://github.com/ai/browserslist
                browsers: ['last 10 versions', "Firefox > 40"],
                cascade: false
            }
            //changed: true,          // &(boolean: true|false, Def:true). Обрабатывать только те файлы которые изменились
            //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
            //minification: true      //  (boolean: true|false, true). Минификация файлов
        },

        //Потдерживаються форматы: js, coffee
        js: {
            coffeeOptions: {          //• (object: for gulp-coffee plugin, Def:{bare: true}).
                bare: true
            }
            //changed: true,          // &(boolean: true|false, Def:true). Обрабатывать только те файлы которые изменились
            //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
            //minification: true      //  (boolean: true|false, true). Минификация файлов
        },

        //Потдерживаються форматы: jpg, png, gif, svg
        //webp всеравно жмёться алгоритмом с потерями при "perfect" (решение автора плагина)
        //Этот метод создание спрайта svg основан на - http://glivera-team.github.io/svg/2016/06/13/svg-sprites-2.html. В этом методе нельзя управлять иконками через js, если вам это нужно то контет картинок внедряйте в html. Для лучшей потдержки старых браузеров (https://github.com/jonathantneal/svg4everybody)
        //Отображать svg иконки в проводнике windows - http://savvateev.org/blog/54/
        images: {
            //changed: true,          // &(boolean: true|false,                 Def:true). Обрабатывать только те картинки которые изменились
            quality: "simple",        //• (String: "perfect" | "good" | "simple" | "low", Def: "simple").
            webp: true,               //• (boolean: true|false,                 Def:false). Все картинки дополнительно жмуться в формат webp и вставляються в ту же папку с такими же именами. Вставьте в ваш .htaccess файл код с этой статьи: https://github.com/vincentorback/WebP-images-with-htaccess. Для потдержки webp
            sprite: false,            //•↓(boolean: true|false,                 Def:false). Просто жмём картинки или создаём спрайт.
            spriteOptions: {
                styleFormat: 'sass',             //  (String: "расширение файла"           Def: "sass"). Для препроцессора стилей в котором будут данные о спрайте
                destStyle: 'sass',               //  (String: "путь"                       Def: "sass"). Для файла препроцессора стилей в котором будут данные о спрайте (относительно "base_tmp")
                relStyleToImg: '../img/sprites', //  (String: "относительный путь"         Def: ""). Путь относительно откомпилированного файла стилей с данными о спрайте к картинке спрайту
                destExamples: 'sprite-examples', //  (Boolean: false | String: "путь"      Def: "sprite-examples"). Папка в которую поместить полезные миксины и примеры вывода стилей и html для отдельных иконок из спрайтов. (относительно "base_tmp")
                png: {
                    prefixIcon: "icon-",         //  (String: "имя файла"                  Def: "icon__"). Префикс к именам иконок спрайта - используеться в формировании классов стилей иконок
                    postfix2x: "@2x",            //• (Boolean: false | String: "имя файла" Def: false). Конец имени файлов с двойным разрешением для создания спрайта для ретины или 4k. "-2x" с такой строкой возникают баги!!!
                    name: 'sprite',              // ↓(String: "имя файла"                  Def: "sprite"). Картинка спрайта
                    styleName: '_png-sprite'     // ↓(String: "имя файла"                  Def: "_png-sprite"). Стили с данными об иконках спрайта
                },
                svg: {
                    prefixIcon: "icon-",         //  (String: "имя файла"                  Def: "svg-icon__"). Префикс к именам иконок спрайта - используеться в формировании классов стилей иконок и идентификаторов в тегах symbol в svg
                    clearColor: false,           //• (boolean: true|false,                 Def:false). Удаление атрибутов цвета чтобы можно было цвет svg иконки задавать через свойство color в стилях
                    name: 'sprite',              // ↓(String: "имя файла"                  Def: "sprite"). Картинка спрайта
                    styleName: '_svg-sprite'     // ↓(String: "имя файла"                  Def: "_png-sprite"). Стили с данными об иконках спрайта
                }
            }
        }
    },

    html: [
        [
            {name: 'pug', src: ['*.pug'], addWatch: ['pug/**/*.pug', "pug/data.json"], sourcemaps: false},
            {name: 'html', src: ['/**/*.{html,htm}'], sourcemaps: false}
        ]
    ],

    css: [
        [
            {name: 'sass2', src: ['sass/**/case-dostaevsky.sass', 'sass/**/case-help-to-mama.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css', autoprefixer: true, disabled: false},
            {name: 'sass', src: ['sass/*.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css', autoprefixer: true, disabled: false}
        ],
        {name: 'css', src: ['/**/*.css'], autoprefixer: true}
    ],

    js: [
        {name: 'coffee', src: 'coffee/*.coffee', addWatch: "coffee/**/*.coffee", dest: 'js'},
        {name: 'js', src: '/**/*.js'}
    ],

    images: [
        [
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
```
## Release Notes

| Release | Notes |
| --- | --- |
| 0.2.0 | Organized options for groups |
| 0.1.1 | Added main "seedingData" option for html task and "pug" option |
| 0.1.0 | Added js module. Add coffee. Added images module. Added sprite creater. Added copy module for copy assets. Added comments for properties |
| 0.0.2 | Added addWatch and took into account the exclusion of files in dependent tasks, add PUG |
| 0.0.1 | Add two level array related tasks (ignore files before tasks) |
| 0.0.0 | Pre alpha release |

## Licence

MIT
<!-- do not want to make nodeinit to complicated, you can edit this whenever you want. -->