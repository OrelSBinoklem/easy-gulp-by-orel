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
    var casualTasks = [];
    var backgroundTasks = [];

    function init(maincallback) {
        config = config(isDevelopment);

        var cfgg = config.general;

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
                    cfgg.browserSyncOptions = extend(neededForBrowserSync, cfgg.browserSyncOptions);
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
                                options = combineGlobalLocal_preConcateBaseSrcInSrcAndAddWatchPattern__options(options);

                                options.ignoreFiles = cascadeMinimatchPatterns.slice();

                                taskAndWatcher(options.name, name, options);

                                cascadeMinimatchPatterns.push(options.src);
                            });
                        } else {
                            //Массив задач
                            level_two = combineGlobalLocal_preConcateBaseSrcInSrcAndAddWatchPattern__options(level_two);
                            taskAndWatcher(level_two.name, name, level_two);
                        }
                    });
                } else {
                    //Одна задача один обьект
                    var options = combineGlobalLocal_preConcateBaseSrcInSrcAndAddWatchPattern__options(config[name]);
                    taskAndWatcher(options.name, name, options);
                }
            }
        }
        taskDependencies.push(casualTasks);

        function combineGlobalLocal_preConcateBaseSrcInSrcAndAddWatchPattern__options(options) {
            //Совмещаем глобальные опции с опциями модуля
            options = extend({}, cfgg, options);

            //Прибавляем к пути src модуля путь base_src, если он есть
            options.src = preConcateBaseSrc(options, options.src);

            //Прибавляем к пути addWatch путь base_src, если он есть
            if("addWatch" in options) {
                options.addWatch = preConcateBaseSrc(options, options.addWatch);
            }

            return options;
        }

        function taskAndWatcher(taskName, nameModule, options) {
            if(!("disabled" in options) || !options.disabled) {
                //dependencies of specific modules
                options = injectDependenciesOfModules(taskName, nameModule, options);

                //casual tasks
                casualTasks.push(taskName);
                lazyRequireTask(taskName, nameModule, options);

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
            }

            return options;
        }

        //browserSync - добавление задачи
        if("browserSync" in cfgg && cfgg.browserSync) {
            backgroundTasks.push("browser-sync");
            lazyRequireTask("browser-sync", "browser-sync", extend({}, cfgg, {browserSyncModule: browserSync}));
        }

        //adaptivePixelPerfect - добавление задачи
        if("adaptivePixelPerfect" in cfgg && cfgg.adaptivePixelPerfect) {
            backgroundTasks.push("adaptive-p-p");
            lazyRequireTask("adaptive-p-p", "adaptive-p-p", extend({}, cfgg, {adaptivePixelPerfectModule: adaptivePixelPerfect}));
        }

        if(backgroundTasks.length) {
            taskDependencies.push(backgroundTasks);
        }
        
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