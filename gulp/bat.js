'use strict';
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');

var bat = function() {
    if(!fs.existsSync("development.bat") || !fs.existsSync("production.bat")) {
        gulp.task("easy:gulp:by:orel:copy:bat", function () {
                return gulp.src([
                    path.join(__dirname, '/development.bat'),
                    path.join(__dirname, '/production.bat')
                ])
                    .pipe(gulp.dest("./"));
            })
            .start("easy:gulp:by:orel:copy:bat");
    }
};

module.exports = bat;