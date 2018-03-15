(function (loader) {
    
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.baseUtilsLoader = loader;
    }

})(function (container) {
    'use strict';
    
    function throwOnBadConfig(config) {
        if (typeof config === 'undefined') {
            throw new Error('Dject requires a configuration object');
        }
    }

    function performEagerLoad(config, registry) {
        if (config.eagerLoad) {
            registry.registerAllModulesFromPaths(config.cwd, config.modulePaths);
        }
    }

    function baseUtilsFactory() {
        return {
            throwOnBadConfig: throwOnBadConfig,
            performEagerLoad: performEagerLoad
        };
    }

    container.register('baseUtils', baseUtilsFactory, []);
});