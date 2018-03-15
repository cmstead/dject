(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.registryLoader = loader;
    }

})(function (container) {
    'use strict';

    function registryFactoryBuilder(fileLoader, moduleUtils) {

        return function(coreContainer) {

            function registerModule(moduleInstance) {
                var name = moduleUtils.getModuleName(moduleInstance);
                var dependencies = moduleUtils.getModuleDependencies(moduleInstance);

                coreContainer.register(name, moduleInstance, dependencies);
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
                registerAllModulesFromPaths: registerAllModulesFromPaths,
                registerModule: registerModule
            };
        }

    }

    var dependencies = [
        'fileLoader',
        'moduleUtils'
    ]
    container.register('registryFactory', registryFactoryBuilder, dependencies);

});