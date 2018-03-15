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
        moduleBuilderFactory,
        registryFactory
    ) {

        function newContainer(config) {
            const coreContainer = containerFactory();
            const registry = registryFactory(config, coreContainer);
            const moduleBuilder = moduleBuilderFactory(coreContainer, registry);
            
            baseUtils.throwOnBadConfig(config);
            baseUtils.performEagerLoad(config, registry)

            return {
                build: moduleBuilder.build,
                getRegisteredModules: registry.getRegisteredModules,
                register: registry.registerModule
            };
        }

        return {
            new: newContainer
        };
    }

    container.register('dject', djectFactory, [
        'baseUtils',
        'containerFactory',
        'moduleBuilderFactory',
        'registryFactory'
    ]);
});

