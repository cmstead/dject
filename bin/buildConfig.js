(function (buildConfig) {
    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
    if (isNode) {
        module.exports = buildConfig();
    } else {
        window.buildDjectConfig = buildConfig();
    }
})(function () {
    'use strict';

    return function buildConfig(config) {
        config = (config !== null && typeof config === 'object') ? config : {};

        config.cwd = typeof config.cwd === 'string' ? config.cwd : '.';
        config.modulePaths = Object.prototype.toString.call(config.modulePaths) === '[object Array]' ? config.modulePaths : ['modules'];
        config.allowOverride = typeof config.allowOverride === 'boolean' ? config.allowOverride : false;
        config.eagerLoad = typeof config.eagerLoad === 'boolean' ? config.eagerLoad : false;

        return config;
    }
});
