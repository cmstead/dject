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
        moduleLoader,
        moduleUtils,
        moduleWrapper
    ) {

        return function (modulePaths, coreContainer) {

            function registerModule(moduleValue, moduleName) {
                const moduleInfo = moduleUtils.getModuleInfo(moduleValue, moduleName);
                const dependencies = moduleInfo.dependencies;
                const name = moduleInfo.name;

                const wrappedModule = moduleWrapper.wrapSpecialModule(moduleValue);

                coreContainer.register(name, wrappedModule, dependencies);
            }

            function override(moduleValue, moduleName) {
                const moduleInfo = moduleUtils.getModuleInfo(moduleValue, moduleName);
                const dependencies = moduleInfo.dependencies;
                const name = moduleInfo.name;

                const wrappedModule = moduleWrapper.wrapSpecialModule(moduleValue);

                coreContainer.override(name, wrappedModule, dependencies);
            }


            function registerModules(moduleValues) {
                moduleValues.forEach(registerModule);
            }

            function loadModuleFromFileSystem(modulePaths, moduleName) {
                const moduleInstance = fileLoader.loadFileFromPaths(modulePaths, moduleName);

                if (moduleInstance !== null) {
                    registerModule(moduleInstance);
                }
            }

            function loadModuleFromInstalledModules(moduleName) {
                const moduleInstance = moduleLoader.loadInstalledModule(moduleName);

                function moduleFactory() {
                    return moduleInstance;
                }

                if (moduleInstance !== null) {
                    registerModule(moduleFactory, moduleName);
                }
            }

            function loadModule(moduleName) {
                if (!coreContainer.isRegistered(moduleName)) {
                    loadModuleFromFileSystem(modulePaths, moduleName)
                }

                if (!coreContainer.isRegistered(moduleName)) {
                    loadModuleFromInstalledModules(moduleName);
                }
            }

            function registerAllModulesFromPaths(modulePaths) {
                fileLoader
                    .loadAllFilesFromPaths(modulePaths)
                    .forEach(registerModule);
            }

            function getRegisteredModules() {
                const containerModules = coreContainer.getModuleRegistry();

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

    const dependencies = [
        'fileLoader',
        'moduleLoader',
        'moduleUtils',
        'moduleWrapper'
    ];

    container.register('registryFactory', registryFactoryBuilder, dependencies);

});
