'use strict';

const gulp = require('gulp');

module.exports = function(options) {
    return function() {
        var stream;
        if("disableRunTask" in options && options.disableRunTask) {
            stream = gulp.watch(options.src);//ВЫЧЕСТЬ ФАЙЛЫ ИЗ ПРЕДЫДУЩИХ ЗАДАЧ
        } else {
            stream = gulp.watch(options.src, [options.name]);
        }

        if("onChangeFile" in options) {
            stream.on("change", options.onChangeFile);
        }

        return stream;
    };
};