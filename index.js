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

        var cg = config.general;

        //Создаём батники для удобства запуска
        require('./gulp/bat')(config, isDevelopment);

        //clean
        if("clean" in cg && cg.clean) {
            taskDependencies.push("clean");
            lazyRequireTask("clean", "clean", cg);
        }

        //browserSync - подготовка
        if("browserSync" in cg && cg.browserSync) {
            var browserSync = require('browser-sync').create();
        }

        //adaptivePixelPerfect - подготовка
        if("adaptivePixelPerfect" in cg && cg.adaptivePixelPerfect) {
            var adaptivePixelPerfect = require('adaptive-pixel-perfect').create();

            if("browserSync" in cg && cg.browserSync) {
                var neededForBrowserSync = {
                    cors: true,
                    middleware: function (req, res, next) {
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        next();
                    },
                    socket: {
                        domain: 'localhost:' + ("browserSyncOptions" in cg && 'port' in cg.browserSyncOptions ? cg.browserSyncOptions.port : 3000)
                    },
                    scriptPath: function (path, port, options) {
                        return "http://" + options.getIn(['socket', 'domain']) + path;
                    }
                };

                if("browserSyncOptions" in cg) {
                    cg.browserSyncOptions = extend(neededForBrowserSync, cg.browserSyncOptions);
                } else {
                    cg.browserSyncOptions = neededForBrowserSync;
                }
            }

        }

        //casual tasks
        for(var name in config) {
            if(name != "general") {
                if(Array.isArray(config[name])) {
                    config[name].forEach(function(options) {
                        taskAndWatcher(options.name, name, options);
                    });
                } else {
                    var options = config[name];
                    taskAndWatcher(options.name, name, options);
                }
            }
        }
        taskDependencies.push(casualTasks);

        function taskAndWatcher(taskName, nameModule, options) {
            //Совмещаем глобальные опции с опциями модуля
            options = extend({}, cg, options);

            //Прибавляем к пути src модуля путь base_src, если он есть
            options.src = joinBaseSrcAndSrc(options);

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
                case 'styles':
                    if("browserSync" in cg && cg.browserSync) {
                        options.writeStyleStream = browserSync.stream;
                    }

                    if("adaptivePixelPerfect" in cg && cg.adaptivePixelPerfect) {
                        options.endStyleTask = function(){
                            adaptivePixelPerfect.endStyleTask();
                        };

                        options.disableRunTask = true;
                        options.onChangeFile = function(event) {
                            adaptivePixelPerfect.changeStyle({
                                filepath: event.path,
                                runTask: function() {
                                    gulp.start(taskName);
                                }
                            });
                        };
                    }
                    break;
            }

            return options;
        }

        //browserSync - добавление задачи
        if("browserSync" in cg && cg.browserSync) {
            backgroundTasks.push("browser-sync");
            lazyRequireTask("browser-sync", "browser-sync", extend({}, cg, {browserSyncModule: browserSync}));
        }

        //adaptivePixelPerfect - добавление задачи
        if("adaptivePixelPerfect" in cg && cg.adaptivePixelPerfect) {
            backgroundTasks.push("adaptive-p-p");
            lazyRequireTask("adaptive-p-p", "adaptive-p-p", extend({}, cg, {adaptivePixelPerfectModule: adaptivePixelPerfect}));
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

    function joinBaseSrcAndSrc(options) {
        if('base_src' in options) {
            if(Array.isArray(options.src)) {
                return options.src.map(function(src){return pathJoin(options.base_src, src)});
            } else {
                return pathJoin(options.base_src, options.src);
            }
        } else {
            return options.src;
        }
    }
};



module.exports = __;