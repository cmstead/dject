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
        let localConfig = Object.create(config);

        localConfig.allowOverride = valueOrDefault(config.allowOverride, false);
        localConfig.eagerLoad = valueOrDefault(config.eagerLoad, false);
        localConfig.errorOnModuleDNE = valueOrDefault(config.errorOnModuleDNE, false);
        localConfig.dependenciesAsObject = valueOrDefault(config.dependenciesAsObject, false);

        return localConfig;
    }

    function baseUtilsFactory(glob, path) {

        function getModulePathsArray(config) {
            return typeof config.modulePaths !== 'undefined'
                ? config.modulePaths.map((modulePath) => path.join(config.cwd, modulePath))
                : [];
        }

        const jsPattern = /^.+\.js$/;

        function buildGlobPath(pathValue) {
            if (jsPattern.test(pathValue)) {
                return pathValue;
            } else {
                return pathValue + path.sep + '*.js';
            }
        }


        function buildAllModulePaths(modulePaths) {
            const globbedPaths = modulePaths
                .map(buildGlobPath)
                .map(globPath => glob.sync(globPath))
                .reduce((currentPaths, newPaths) => currentPaths.concat(newPaths), []);

            return globbedPaths;

        }

        function buildModulePaths(config) {
            const modulePathsArray = getModulePathsArray(config);

            return buildAllModulePaths(modulePathsArray);
        }

        return {
            buildLocalConfig: buildLocalConfig,
            buildModulePaths: buildModulePaths,
            throwOnBadConfig: throwOnBadConfig,
            performEagerLoad: performEagerLoad
        };
    }

    container.register('baseUtils', baseUtilsFactory, ['glob', 'path']);
});
