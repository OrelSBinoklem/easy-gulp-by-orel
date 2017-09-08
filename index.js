'use strict';
//Модули
const path = require('path');
const extend = require('extend');
const gulp = require('gulp');
const runSequence = require('run-sequence');

//Мои модули
const pathJoin = require('./gulp/path.join.js');

var __ = function(config) {
    var isDevelopment;

    var taskDependencies = [];
    var spritesTasks = [];
    var casualTasks = [], namesCasualTasks = /^(html|css|js|images|copy)$/gim;
    var backgroundTasks = [];

    function init(maincallback) {
        config = config(isDevelopment);

        var cfg_g = config.general;
        var cfg_common_m = config.common_modules;
        var cfg_all_m = config.all_casual_modules;
        var cfg_m = config.casual_modules;

        cfg_common_m = extend(true, {}, cfg_g, cfg_common_m);

        //Создаём батники для удобства запуска
        require('./gulp/bat')(config, isDevelopment);

        //clean
        if("clean" in cfg_common_m && cfg_common_m.clean) {
            taskDependencies.push("clean");
            lazyRequireTask("clean", "clean", cfg_common_m);
        }

        //browserSync - подготовка
        if("browserSync" in cfg_common_m && cfg_common_m.browserSync) {
            var browserSync = require('browser-sync').create();
        }

        //adaptivePixelPerfect - подготовка
        if("adaptivePixelPerfect" in cfg_common_m && cfg_common_m.adaptivePixelPerfect) {
            var adaptivePixelPerfect = require('adaptive-pixel-perfect').create();

            if("browserSync" in cfg_common_m && cfg_common_m.browserSync) {
                var neededForBrowserSync = {
                    cors: true,
                    middleware: function (req, res, next) {
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        next();
                    },
                    socket: {
                        domain: 'localhost:' + ("browserSyncOptions" in cfg_common_m && 'port' in cfg_common_m.browserSyncOptions ? cfg_common_m.browserSyncOptions.port : 3000)
                    },
                    scriptPath: function (path, port, options) {
                        return "http://" + options.getIn(['socket', 'domain']) + path;
                    }
                };

                if("browserSyncOptions" in cfg_common_m) {
                    cfg_common_m.browserSyncOptions = extend(true, neededForBrowserSync, cfg_common_m.browserSyncOptions);
                } else {
                    cfg_common_m.browserSyncOptions = neededForBrowserSync;
                }
            }

        }

        //casual tasks
        for(var name in config) {
            namesCasualTasks.lastIndex = 0;
            if(namesCasualTasks.test(name)) {
                if(Array.isArray(config[name])) {
                    config[name].forEach(function(level_two) {
                        if(Array.isArray(level_two)) {
                            //Вложенный массив взаимосвязанных задач
                            var cascadeMinimatchPatterns = [];
                            level_two.forEach(function(options) {
                                options = combineGlobal_Task_Local_preConcateBaseSrcInSrcAndAddWatchPattern__options(name, options);

                                options.ignoreFiles = cascadeMinimatchPatterns.slice();

                                taskAndWatcher(options.name, name, options);

                                if(!("disabled" in options) || !options.disabled) {
                                    cascadeMinimatchPatterns.push(options.src);
                                } else {
                                    if(options.disabled === "files-consider") {
                                        cascadeMinimatchPatterns.push(options.src);
                                    }
                                }
                            });
                        } else {
                            //Массив задач
                            level_two = combineGlobal_Task_Local_preConcateBaseSrcInSrcAndAddWatchPattern__options(name, level_two);
                            taskAndWatcher(level_two.name, name, level_two);
                        }
                    });
                } else {
                    //Одна задача один обьект
                    var options = combineGlobal_Task_Local_preConcateBaseSrcInSrcAndAddWatchPattern__options(name, config[name]);
                    taskAndWatcher(options.name, name, options);
                }
            }
        }
        if(spritesTasks.length){taskDependencies.push(spritesTasks)}
        if(casualTasks.length){taskDependencies.push(casualTasks)}

        function combineGlobal_Task_Local_preConcateBaseSrcInSrcAndAddWatchPattern__options(nameModule, options) {
            //Совмещаем глобальные опции с общими опциями модуля и опциями конкретной задачи
            if(nameModule in cfg_m) {
                options = extend(true, {}, cfg_g, cfg_all_m, cfg_m[nameModule], options);
            } else {
                options = extend(true, {}, cfg_g, cfg_all_m, options);
            }

            //Прибавляем к пути src модуля путь base_src, если он есть
            options.src = preConcateBaseSrc(options, options.src);

            //Прибавляем к пути addWatch путь base_src, если он есть
            if("addWatch" in options && options.addWatch) {
                options.addWatch = preConcateBaseSrc(options, options.addWatch);
            }

            return options;
        }

        function taskAndWatcher(taskName, nameModule, options) {
            if(!("disabled" in options) || !options.disabled) {

                //dependencies of specific modules
                options = injectDependenciesOfModules(taskName, nameModule, options);

                //sprites tasks and casual tasks
                if(nameModule == 'images' && 'sprite' in options && options.sprite) {
                    spritesTasks.push(taskName);
                } else {
                    casualTasks.push(taskName);
                }
                lazyRequireTask(taskName, nameModule, options);

                //casual tasks for add watch files
                if("addWatch" in options && options.addWatch) {
                    //casualTasks.push(taskName + ":lib"); надо только для watchera, просто запускать ненадо потомучто это такая же задача как и выше
                    lazyRequireTask(taskName + ":lib", nameModule, extend(true, {}, options, {changed: false}));
                }

                //watchers
                if("watch" in options && options.watch) {
                    backgroundTasks.push(taskName + ":watch");
                    lazyRequireTask(taskName + ":watch", "watcher", options);
                }
            }
        }

        //Связывание специфических задач с стандартными
        function injectDependenciesOfModules(taskName, nameModule, options) {
            switch(nameModule) {
                case 'html':
                    if("browserSync" in cfg_common_m && cfg_common_m.browserSync) {
                        options.writeHTMLHandler = browserSync.stream;
                    }
                    break;
                case 'css':
                    if("browserSync" in cfg_common_m && cfg_common_m.browserSync) {
                        options.writeStyleStream = browserSync.stream;
                    }
                    break;
                case 'js':
                    if("browserSync" in cfg_common_m && cfg_common_m.browserSync) {
                        options.writeJsStream = browserSync.stream;
                    }
                    break;
                case 'images':
                    if("browserSync" in cfg_common_m && cfg_common_m.browserSync) {
                        options.writeImgStream = browserSync.stream;
                    }
                    break;
            }

            return options;
        }

        //browserSync - добавление задачи
        if("browserSync" in cfg_common_m && cfg_common_m.browserSync) {
            backgroundTasks.push("browser-sync");
            lazyRequireTask("browser-sync", "browser-sync", extend(true, {}, cfg_common_m, {browserSyncModule: browserSync}));
        }

        //adaptivePixelPerfect - добавление задачи
        if("adaptivePixelPerfect" in cfg_common_m && cfg_common_m.adaptivePixelPerfect) {
            backgroundTasks.push("adaptive-p-p");
            lazyRequireTask("adaptive-p-p", "adaptive-p-p", extend(true, {}, cfg_common_m, {adaptivePixelPerfectModule: adaptivePixelPerfect}));
        }

        if(backgroundTasks.length){taskDependencies.push(backgroundTasks)}

        if("modifyTasks" in cfg_g){taskDependencies = cfg_g.modifyTasks(taskDependencies)}

        taskDependencies.push(function(callback) {
            maincallback();
            //callback();
        });
        runSequence.apply(null, taskDependencies);
    }

    gulp.task('easy:gulp:by:orel', function(callback) {
        isDevelopment = true;
        init(callback);
    });

    gulp.task('easy:gulp:by:orel:production', function(callback) {
        isDevelopment = false;
        init(callback);
    });

    function lazyRequireTask(taskName, path, options) {
        gulp.task(taskName, function(callback) {
            var task = require('./gulp/tasks/' + path).call(this, options);

            return task(callback);
        });
    }

    function preConcateBaseSrc(options, pattern) {
        if('base_src' in options) {
            if(Array.isArray(pattern)) {
                return pattern.map(function(src){return pathJoin(options.base_src, src)});
            } else {
                return pathJoin(options.base_src, pattern);
            }
        } else {
            return pattern;
        }
    }
};



module.exports = __;