(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleBuilderFactoryLoader = loader;
    }

})(function (container) {
    'use strict';

    function moduleBuilderFactoryBuilder() {
        return function (coreContainer, registry, config) {

            function loadModuleIfMissing(moduleName) {
                if (!coreContainer.isRegistered(moduleName)) {
                    registry.loadModule(moduleName);
                }
            }

            function loadDependencies(moduleName) {
                const dependencies = coreContainer.getDependencies(moduleName);

                dependencies.forEach(function (moduleName) {
                    loadModuleIfMissing(moduleName);
                    loadDependencies(moduleName);
                });
            }

            function buildModule(moduleName) {
                loadModuleIfMissing(moduleName);
                loadDependencies(moduleName);

                return config.dependenciesAsObject
                    ? coreContainer.buildWithObject(moduleName)
                    : coreContainer.build(moduleName);
            }

            function build(moduleName) {
                try {
                    return buildModule(moduleName);
                } catch (e) {
                    const message = 'An error occurred while processing dependencies: ' + e.message;
                    throw new Error(message);
                }
            }

            return {
                build: build
            };
        }
    }

    container.register('moduleBuilderFactory', moduleBuilderFactoryBuilder, []);

});
