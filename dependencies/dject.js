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
        moduleLoader,
        moduleUtils,
        registryFactory
    ) {

        function newContainer(config) {
            baseUtils.throwOnBadConfig(config);

            const localConfig = baseUtils.buildLocalConfig(config);
            const modulePaths = baseUtils.buildModulePaths(localConfig);

            const coreContainer = containerFactory();
            const registry = registryFactory(modulePaths, coreContainer);
            const moduleBuilder = moduleBuilderFactory(coreContainer, registry, localConfig);

            baseUtils.performEagerLoad(localConfig.eagerLoad, modulePaths, registry)

            function checkModuleDNE(moduleName) {
                return localConfig.errorOnModuleDNE
                    && !fileLoader.isFileInPaths(modulePaths, moduleName)
                    && moduleLoader.loadInstalledModule(moduleName) === null;
            }

            function throwIfModuleDNE(moduleName) {
                if (checkModuleDNE(moduleName)) {
                    const message = 'Cannot register module that does not exist in filesystem; errorOnModuleDNE is set to true';
                    throw new Error(message);
                }
            }

            function throwIfOverrideDisallowed() {
                if (!localConfig.allowOverride) {
                    const message = 'Cannot override module, allowOverride is set to false.';
                    throw new Error(message);
                }
            }

            function getLocalModuleName(moduleValue, moduleName) {
                return typeof moduleName === 'string'
                    ? moduleName
                    : moduleUtils.getModuleName(moduleValue);
            }

            function override(moduleValue, moduleName) {
                const localName = getLocalModuleName(moduleValue, moduleName);

                throwIfOverrideDisallowed();
                throwIfModuleDNE(localName);

                registry.override(moduleValue, localName);
            }

            function register(moduleValue, moduleName) {
                const localName = getLocalModuleName(moduleValue, moduleName);

                throwIfModuleDNE(localName);

                registry.registerModule(moduleValue, moduleName);
            }

            function buildChildConfig(config) {
                let childConfig = Object.create(config);
                childConfig.allowOverride = true;

                return childConfig;
            }

            function buildNew() {
                const childConfig = buildChildConfig(localConfig);
                const childContainer = newContainer(childConfig);
                const registeredModules = coreContainer.getModuleRegistry();

                Object
                    .keys(registeredModules)
                    .forEach(function (moduleKey) {
                        if (moduleKey === '__container') {
                            return;
                        }

                        const moduleValue = registeredModules[moduleKey];
                        childContainer.register(moduleValue.originalModule, moduleKey);
                    });

                return childContainer;
            }

            function getDependencyTree(moduleName) {
                registry.loadModule(moduleName);

                const moduleBuilder = registry.getModuleBuilder(moduleName);
                const dependencies = moduleBuilder.dependencies();

                return {
                    name: moduleName,
                    instantiable: Boolean(moduleBuilder['@instantiable']),
                    singleton: Boolean(moduleBuilder['@singleton']),
                    dependencies: dependencies.map(getDependencyTree)
                };
            }

            function buildDependencyMap(dependencyNames, injectedDependencies) {
                return dependencyNames.reduce(function (dependencyMap, dependencyName, index) {
                    dependencyMap[dependencyName] = injectedDependencies[index];

                    return dependencyMap;
                }, {});
            }

            function copyProps(destination, source) {
                Object
                    .keys(source)
                    .forEach(function (key) {
                        if (typeof destination[key] === 'undefined') {
                            destination[key] = source[key];
                        }
                    });

                return destination;
            }

            const containerApi = {
                build: moduleBuilder.build,
                buildDependencyMap: buildDependencyMap,
                copyProps: copyProps,
                getRegisteredModules: registry.getRegisteredModules,
                getDependencyTree: getDependencyTree,
                loadModule: registry.loadModule,
                new: buildNew,
                override: override,
                register: register,
                registerModules: registry.registerModules
            };

            registry.registerModule(function __container() { return containerApi; });

            return containerApi;
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
        'moduleLoader',
        'moduleUtils',
        'registryFactory'
    ]);
});

