(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.registryLoader = loader;
    }

})(function (container) {
    'use strict';

    function registryFactory(containerFactory, fileLoader, moduleUtils) {

        return function() {
            var registryContainer = containerFactory();

            function registerModule(moduleInstance) {
                var name = moduleUtils.getModuleName(moduleInstance);
                var dependencies = moduleUtils.getModuleDependencies(moduleInstance);

                registryContainer.register(name, moduleInstance, dependencies);
            }

            function registerAllModulesFromPaths(cwd, modulePaths) {
                fileLoader
                    .loadAllFilesFromPaths(cwd, modulePaths)
                    .forEach(registerModule);
            }

            function getRegisteredModules() {
                var containerModules = registryContainer.getModuleRegistry();

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
        'containerFactory',
        'fileLoader',
        'moduleUtils'
    ]
    container.register('registry', registryFactory, dependencies);

});