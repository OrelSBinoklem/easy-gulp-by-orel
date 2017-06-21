'use strict';

const gulp = require('gulp');
const combine = require('stream-combiner2').obj;
const ignoreFiles = require("../ignore-files");
const path = require("path");

module.exports = function(options) {
    return function() {
        var stream;
        if("addWatch" in options) {
            stream = combine(
                gulp.watch(options.src, function (e) {
                    if(!("disableRunTask" in options && options.disableRunTask)) {
                        if(!ignoreFiles.test(path.relative(process.cwd(), e.path), options.ignoreFiles)) {
                            gulp.start(options.name);
                        }
                    }
                }),
                gulp.watch(options.addWatch, function (e) {
                    if(!("disableRunTask" in options && options.disableRunTask)) {
                        if(!ignoreFiles.test(path.relative(process.cwd(), e.path), options.ignoreFiles)) {
                            gulp.start(options.name);
                        }
                    }
                }));
        } else {
            stream = gulp.watch(options.src, function (e) {
                if(!("disableRunTask" in options && options.disableRunTask)) {
                    //console.log(e);
                    if(!ignoreFiles.test(path.relative(process.cwd(), e.path), options.ignoreFiles)) {
                        gulp.start(options.name);
                    }
                }
            });
        }

        return stream;
    };
};