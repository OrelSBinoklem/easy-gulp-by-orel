'use strict';

const $ = require('gulp-load-plugins')();
const combine = require('stream-combiner2').obj;
const through2 = require("through2").obj;
const multimatch = require('multimatch');

module.exports = {
    stream: function(ignoreFiles) {
        var arrTasks = [];
        ignoreFiles.forEach(function (el) {
            var filter = $.filter(el, {restore: true});
            arrTasks.push(filter);
            arrTasks.push(through2(function (file, enc, callback) {
                callback();
            }));
            arrTasks.push(filter.restore);
        });
        return combine.apply(null, arrTasks);
    },
    test: function(path, ignoreFiles) {
        for(var i in ignoreFiles) {
            if(multimatch([path], ignoreFiles[i], {dot: true}).length) {
                return true;
            }
        }

        return false;
    }
};