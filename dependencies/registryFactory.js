(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.registryLoader = loader;
    }

})(function (container) {
    'use strict';

    function registryFactoryBuilder(
        fileLoader,
        moduleUtils,
        moduleWrapper
    ) {

        return function (modulePaths, coreContainer) {

            function registerModule(moduleValue, moduleName) {
                var moduleInfo = moduleUtils.getModuleInfo(moduleValue, moduleName);
                var dependencies = moduleInfo.dependencies;
                var name = moduleInfo.name;

                var wrappedModule = moduleWrapper.wrapSpecialModule(moduleValue);

                coreContainer.register(name, wrappedModule, dependencies);
            }

            function override(moduleValue, moduleName) {
                var moduleInfo = moduleUtils.getModuleInfo(moduleValue, moduleName);
                var dependencies = moduleInfo.dependencies;
                var name = moduleInfo.name;

                var wrappedModule = moduleWrapper.wrapSpecialModule(moduleValue);

                coreContainer.override(name, wrappedModule, dependencies);
            }


            function registerModules(moduleValues) {
                moduleValues.forEach(registerModule);
            }

            function loadModule(moduleName) {
                if (!coreContainer.isRegistered(moduleName)) {
                    var moduleInstance = fileLoader.loadFileFromPaths(modulePaths, moduleName);

                    if (moduleInstance !== null) {
                        registerModule(moduleInstance);
                    }
                }
            }

            function registerAllModulesFromPaths(modulePaths) {
                fileLoader
                    .loadAllFilesFromPaths(modulePaths)
                    .forEach(registerModule);
            }

            function getRegisteredModules() {
                var containerModules = coreContainer.getModuleRegistry();

                return Object.keys(containerModules);
            }

            return {
                getModuleBuilder: coreContainer.getModuleBuilder,
                getRegisteredModules: getRegisteredModules,
                loadModule: loadModule,
                override: override,
                registerAllModulesFromPaths: registerAllModulesFromPaths,
                registerModule: registerModule,
                registerModules: registerModules
            };
        }

    }

    var dependencies = [
        'fileLoader',
        'moduleUtils',
        'moduleWrapper'
    ];

    container.register('registryFactory', registryFactoryBuilder, dependencies);

});