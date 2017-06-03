'use strict';
const extend = require('extend');

module.exports = function(options) {

    var adaptivePixelPerfectOptions = {
        port: 3010,
        design: "design"
    };

    if("adaptivePixelPerfectOptions" in options) {
        adaptivePixelPerfectOptions = extend(adaptivePixelPerfectOptions, options.adaptivePixelPerfectOptions);
    }

    return function(callback) {
        if("browserSync" in options && options.browserSync) {
            options.adaptivePixelPerfectModule.start(
                adaptivePixelPerfectOptions.port,
                adaptivePixelPerfectOptions.design,
                "browserSyncOptions" in options && 'port' in options.browserSyncOptions ? options.browserSyncOptions.port : 3000
            );
        } else {
            options.adaptivePixelPerfectModule.start(
                adaptivePixelPerfectOptions.port,
                adaptivePixelPerfectOptions.design
            );
        }
        //callback();
    };
};