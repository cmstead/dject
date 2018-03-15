(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.registryLoader = loader;
    }

})(function (container) {
    'use strict';

    function registryFactoryBuilder(fileLoader, moduleUtils) {

        return function (config, coreContainer) {

            function registerModule(moduleInstance, moduleName) {
                var dependencies = moduleUtils.getModuleDependencies(moduleInstance);
                var name = typeof moduleName === 'string'
                    ? moduleName
                    : moduleUtils.getModuleName(moduleInstance);

                coreContainer.register(name, moduleInstance, dependencies);
            }

            function loadModule(moduleName) {
                var cwd = config.cwd;
                var modulePaths = config.modulePaths
                var moduleInstance = fileLoader.loadFileFromPaths(cwd, modulePaths, moduleName);

                registerModule(moduleInstance);
            }

            function registerAllModulesFromPaths(cwd, modulePaths) {
                fileLoader
                    .loadAllFilesFromPaths(cwd, modulePaths)
                    .forEach(registerModule);
            }

            function getRegisteredModules() {
                var containerModules = coreContainer.getModuleRegistry();

                return Object.keys(containerModules);
            }

            return {
                getRegisteredModules: getRegisteredModules,
                loadModule: loadModule,
                registerAllModulesFromPaths: registerAllModulesFromPaths,
                registerModule: registerModule
            };
        }

    }

    var dependencies = [
        'fileLoader',
        'moduleUtils'
    ];
    
    container.register('registryFactory', registryFactoryBuilder, dependencies);

});