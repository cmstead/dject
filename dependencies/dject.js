(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.djectLoader = loader;
    }

})(function djectLoader(container) {
    'use strict';

    function djectFactory(
        baseUtils,
        containerFactory,
        fileLoader,
        moduleBuilderFactory,
        moduleUtils,
        registryFactory
    ) {

        function newContainer(config) {
            baseUtils.throwOnBadConfig(config);

            var localConfig = baseUtils.buildLocalConfig(config);
            var modulePaths = baseUtils.buildModulePaths(localConfig);

            var coreContainer = containerFactory();
            var registry = registryFactory(modulePaths, coreContainer);
            var moduleBuilder = moduleBuilderFactory(coreContainer, registry);

            baseUtils.performEagerLoad(localConfig.eagerLoad, modulePaths, registry)

            function override(moduleValue, moduleName) {
                if (localConfig.allowOverride) {
                    registry.override(moduleValue, moduleName);
                } else {
                    var message = 'Cannot override module, allowOverride is set to false.';
                    throw new Error(message);
                }
            }

            function checkModuleDNE(moduleName) {
                return localConfig.errorOnModuleDNE
                    && !fileLoader.isFileInPaths(modulePaths, moduleName);
            }

            function register(moduleValue, moduleName) {
                var localName = typeof moduleName === 'string'
                    ? moduleName
                    : moduleUtils.getModuleName(moduleValue);

                if (checkModuleDNE(localName)) {
                    var message = 'Cannot register module that does not exist in filesystem; errorOnModuleDNE is set to true';
                    throw new Error(message);
                } else {
                    registry.registerModule(moduleValue, moduleName);
                }
            }

            function buildChildConfig(config) {
                var childConfig = Object.create(config);
                childConfig.allowOverride = true;

                return childConfig;
            }

            function buildNew() {
                var childConfig = buildChildConfig(localConfig);
                var childContainer = newContainer(childConfig);
                var registeredModules = coreContainer.getModuleRegistry();

                Object
                    .keys(registeredModules)
                    .forEach(function (moduleKey) {
                        var moduleValue = registeredModules[moduleKey];
                        childContainer.register(moduleValue, moduleKey);
                    });

                return childContainer;
            }

            function getDependencyTree(moduleName) {
                registry.loadModule(moduleName);

                var moduleBuilder = registry.getModuleBuilder(moduleName);
                var dependencies = moduleBuilder.dependencies();

                return {
                    name: moduleName,
                    instantiable: Boolean(moduleBuilder['@instantiable']),
                    singleton: Boolean(moduleBuilder['@singleton']),
                    dependencies: dependencies.map(getDependencyTree)
                };
            }

            return {
                build: moduleBuilder.build,
                getRegisteredModules: registry.getRegisteredModules,
                getDependencyTree: getDependencyTree,
                loadModule: registry.loadModule,
                new: buildNew,
                override: override,
                register: register,
                registerModules: registry.registerModules
            };
        }

        return {
            new: newContainer
        };
    }

    container.register('dject', djectFactory, [
        'baseUtils',
        'containerFactory',
        'fileLoader',
        'moduleBuilderFactory',
        'moduleUtils',
        'registryFactory'
    ]);
});

