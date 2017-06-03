'use strict';
const extend = require('extend');

module.exports = function(options) {

    var browserSyncOptions = {
        server: options.base_dest
    };

    if("browserSyncOptions" in options) {
        browserSyncOptions = extend(browserSyncOptions, options.browserSyncOptions);
    }

    return function(callback) {
        options.browserSyncModule.init(browserSyncOptions);
        //callback();
    };
};