'use strict';

const del = require('del');

module.exports = function(options) {

    return function() {
        return del(options.base_dest);
    };

};