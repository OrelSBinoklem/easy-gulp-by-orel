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
 * The "@" sign at the beginning of a comment of properties denotes a particular specificity of a property or indicates its subordination
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
        //modifyTasks:                //@ (function: function(taskDependencies) return new taskDependencies, Notdef). The ability to modify a two-level array of tasks to add their tasks or remove standard ones. This array is processed by the "run-sequence" module in the "easy-gulp-by-orel"
    },
    
    common_modules: {
        clean: true,                  //• (boolean: true|false, Def:false). Destroys the folders "base_tmp", "base_dest" before running the main tasks

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
        sourcemaps: dev,             //• (boolean: true|false, Notdef). Sourcemaps files
        rigger: false                //• (boolean: true|false, false). Inserting the code of external files into the file being processed
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
            pugInsertCurPage: true,   //@ (boolean: true|false, Def:true). In this mode, a variable with the name "current" is transferred to each pug file in which there is a name of the executable (the one in which to extend and everything to be included) of the pug file
            //changed: true,          // &(boolean: true|false, Def:true). Process only those files that have changed
            sourcemaps: false         // &(boolean: true|false, Def:false). Sourcemaps files
            //rigger: false           // &(boolean: true|false, false). Inserting the code of external files into the file being processed
        },

        //Supported formats: sass, scss, less, styl, css
        css: {
            autoprefixer: true,       //• (boolean: true|false, Def: true). Vendor prefixes, so that more browsers use modern chips even though sometimes with small bugs. For example -webkit-transition:
            autoprefixerOptions: {    //  (object: for gulp-autoprefixer plugin Def:{browsers: ['last 2 versions'], cascade: false}). See details here: //https://github.com/ai/browserslist
                browsers: ['last 10 versions', "Firefox > 40"],
                cascade: false
            }
            //changed: true,          // &(boolean: true|false, Def:true). Process only those files that have changed
            //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
            //minification: true      //  (boolean: true|false, true). Минификация files
            //rigger: false           // &(boolean: true|false, false). Inserting the code of external files into the file being processed
        },

        //Supported formats: js, coffee
        js: {
            coffeeOptions: {          //• (object: for gulp-coffee plugin, Def:{bare: true}).
                bare: true
            }
            //changed: true,          // &(boolean: true|false, Def:true). Process only those files that have changed
            //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
            //minification: true      //  (boolean: true|false, true). Минификация files
            //rigger: false           // &(boolean: true|false, false). Inserting the code of external files into the file being processed
        },

        //Supported formats: jpg, png, gif, svg
        //The webp is still compressed by the lossy algorithm with "perfect" (the plugin author's solution)
        //This method of creating the svg sprite is based on - http://glivera-team.github.io/svg/2016/06/13/svg-sprites-2.html. In this method, you can not manage icons through js, if you need it then embed images into html. To better support older browsers (https://github.com/jonathantneal/svg4everybody)
        //Display svg icons in Windows Explorer - http://savvateev.org/blog/54/
        images: {
            //changed: true,          // &(boolean: true|false,                 Def:true). Process only those files that have changed
            quality: "normal",        //• (String: "perfect" | "good" | "normal" | "simple" | "low", Def: "normal").
            qualityFolders: true,     //@ (boolean: true|false,                 Def:true). If the pictures are in the root of the folder with the quality name ("perfect" | "good" | "simple" | "low") then such pictures should be compressed with the quality of the corresponding name. Then move to the folder on the level up (in the folder in which lies the folder with the name of the quality ie the parent folder).
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
            {name: 'pug', src: ['*.pug'], addWatch: ['pug/**/*.pug', "pug/seeding-data.json"], sourcemaps: false},
            {name: 'html', src: ['/**/*.{html,htm}'], sourcemaps: false}
        ]
    ],

    css: [
        [
            {name: 'sass2', src: ['sass/**/case-dostaevsky.sass', 'sass/**/case-help-to-mama.sass'], addWatch: "sass/**/{constant,footer,header,mixing}.sass", dest: 'css'},
            {name: 'sass', src: ['sass/*.sass'], addWatch: ["sass/**/{constant,footer,header,mixing}.sass", "../tmp/sass/png-sprite.sass"], dest: 'css'}
        ],
        {name: 'css', src: ['/**/*.css']}
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