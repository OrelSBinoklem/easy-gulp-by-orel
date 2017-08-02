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
    var casualTasks = [];
    var backgroundTasks = [];

    function init(maincallback) {
        config = config(isDevelopment);

        var cfgg = config.general;
        var cfgm = {};
        for(var key in cfgg) {
            if(/task_/gim.test(key)) {
                cfgm[key] = cfgg[key];
                delete cfgg[key];
            }
        }

        //Создаём батники для удобства запуска
        require('./gulp/bat')(config, isDevelopment);

        //clean
        if("clean" in cfgg && cfgg.clean) {
            taskDependencies.push("clean");
            lazyRequireTask("clean", "clean", cfgg);
        }

        //browserSync - подготовка
        if("browserSync" in cfgg && cfgg.browserSync) {
            var browserSync = require('browser-sync').create();
        }

        //adaptivePixelPerfect - подготовка
        if("adaptivePixelPerfect" in cfgg && cfgg.adaptivePixelPerfect) {
            var adaptivePixelPerfect = require('adaptive-pixel-perfect').create();

            if("browserSync" in cfgg && cfgg.browserSync) {
                var neededForBrowserSync = {
                    cors: true,
                    middleware: function (req, res, next) {
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        next();
                    },
                    socket: {
                        domain: 'localhost:' + ("browserSyncOptions" in cfgg && 'port' in cfgg.browserSyncOptions ? cfgg.browserSyncOptions.port : 3000)
                    },
                    scriptPath: function (path, port, options) {
                        return "http://" + options.getIn(['socket', 'domain']) + path;
                    }
                };

                if("browserSyncOptions" in cfgg) {
                    cfgg.browserSyncOptions = extend(true, neededForBrowserSync, cfgg.browserSyncOptions);
                } else {
                    cfgg.browserSyncOptions = neededForBrowserSync;
                }
            }

        }

        //casual tasks
        for(var name in config) {
            if(name != "general") {
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
            if("task_" + nameModule in cfgm) {
                options = extend(true, {}, cfgg, cfgm["task_" + nameModule], options);
            } else {
                options = extend(true, {}, cfgg, options);
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
                    if("browserSync" in cfgg && cfgg.browserSync) {
                        options.writeHTMLHandler = browserSync.stream;
                    }
                    break;
                case 'css':
                    if("browserSync" in cfgg && cfgg.browserSync) {
                        options.writeStyleStream = browserSync.stream;
                    }
                    break;
                case 'js':
                    if("browserSync" in cfgg && cfgg.browserSync) {
                        options.writeJsStream = browserSync.stream;
                    }
                    break;
                case 'images':
                    if("browserSync" in cfgg && cfgg.browserSync) {
                        options.writeImgStream = browserSync.stream;
                    }
                    break;
            }

            return options;
        }

        //browserSync - добавление задачи
        if("browserSync" in cfgg && cfgg.browserSync) {
            backgroundTasks.push("browser-sync");
            lazyRequireTask("browser-sync", "browser-sync", extend(true, {}, cfgg, {browserSyncModule: browserSync}));
        }

        //adaptivePixelPerfect - добавление задачи
        if("adaptivePixelPerfect" in cfgg && cfgg.adaptivePixelPerfect) {
            backgroundTasks.push("adaptive-p-p");
            lazyRequireTask("adaptive-p-p", "adaptive-p-p", extend(true, {}, cfgg, {adaptivePixelPerfectModule: adaptivePixelPerfect}));
        }

        if(backgroundTasks.length){taskDependencies.push(backgroundTasks)}
        
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