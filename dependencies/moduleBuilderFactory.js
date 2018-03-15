(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleBuilderFactoryLoader = loader;
    }

})(function (container) {
    'use strict';

    function moduleBuilderFactoryBuilder() {
        return function (coreContainer, registry) {

            function loadModuleIfMissing(moduleName) {
                if(!coreContainer.isRegistered(moduleName)){
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

            function build(moduleName) {
                loadDependencies(moduleName);
                return coreContainer.build(moduleName);
            }

            return {
                build: build
            };
        }
    }

    container.register('moduleBuilderFactory', moduleBuilderFactoryBuilder, []);

});