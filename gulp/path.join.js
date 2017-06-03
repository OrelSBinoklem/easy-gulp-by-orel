'use strict';
//Модули
const path = require('path');

var vinylJoin = function() {
    var paths = [].slice.call(arguments);
    var result;

    const isRevert = paths.length && /^\!/gim.test(paths[paths.length-1]);
    if(isRevert) {
        paths[paths.length-1] = paths[paths.length-1].substring(1);
    }

    result = path.join.apply(null, paths);

    if(isRevert) {
        result = '!' + result;
    }
    
    return result;
};

module.exports = vinylJoin;