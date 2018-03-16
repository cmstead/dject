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

    function performEagerLoad(eagerLoad, modulePaths, registry) {
        if (eagerLoad) {
            registry.registerAllModulesFromPaths(modulePaths);
        }
    }

    function valueOrDefault(value, defaultValue) {
        return Boolean(value) ? value : defaultValue;
    }

    function buildLocalConfig(config) {
        var localConfig = Object.create(config);

        localConfig.allowOverride = valueOrDefault(config.allowOverride, false);
        localConfig.eagerLoad = valueOrDefault(config.eagerLoad, false);
        localConfig.errorOnModuleDNE = valueOrDefault(config.errorOnModuleDNE, false);

        return localConfig;
    }

    function baseUtilsFactory(path) {
        function buildModulePaths(config) {
            return config.modulePaths.map(function (modulePath) {
                return path.join(config.cwd, modulePath);
            })
        }

        return {
            buildLocalConfig: buildLocalConfig,
            buildModulePaths: buildModulePaths,
            throwOnBadConfig: throwOnBadConfig,
            performEagerLoad: performEagerLoad
        };
    }

    container.register('baseUtils', baseUtilsFactory, ['path']);
});