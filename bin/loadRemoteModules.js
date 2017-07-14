'use strict';

var fs = require('fs');

function loadRemoteModules(cwd, container) {
    return function (path) {
        var readPath = [process.cwd(), cwd, path].join('/');

        fs.readdirSync(readPath).forEach(function (fileName){
            var filePath = [readPath, fileName].join('/');
            if(!fs.statSync(filePath).isDirectory()){
                container.register(require(filePath));
            }
        });
    };
}

module.exports = loadRemoteModules;