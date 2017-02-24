'use strict';

function buildConfig(config) {
    config = (config !== null && typeof config === 'object') ? config : {};

    config.cwd = typeof config.cwd === 'string' ? config.cwd : '.';
    config.modulePaths = Object.prototype.toString.call(config.modulePaths) === '[object Array]' ? config.modulePaths : ['modules'];

    return config;
}

module.exports = buildConfig;