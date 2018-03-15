(function (loader) {

    if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.djectLoader = loader;
    }

})(function djectLoader(container) {
    'use strict';

    function djectFactory(containerFactory, registryFactory) {

        function newContainer(config) {
            const coreContainer = containerFactory();
            const localRegistry = registryFactory(coreContainer);

            if(typeof config === 'undefined') {
                throw new Error('Dject requires a configuration object');
            }

            if(config.eagerLoad) {
                localRegistry.registerAllModulesFromPaths(config.cwd, config.modulePaths);
            }

            return {
                getRegisteredModules: localRegistry.getRegisteredModules,
                register: localRegistry.registerModule
            };
        }

        return {
            new: newContainer
        };
    }

    container.register('dject', djectFactory, [
        'containerFactory',
        'registryFactory'
    ]);
});

