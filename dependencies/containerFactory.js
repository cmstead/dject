(function (loader) {

    if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.containerFactoryLoader = loader;
    }

})(function(container) {
    'use strict';

    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
    const djectCoreFactory = isNode ? require('dject-core') : window.djectCoreFactory;

    function containerFactory() {
        return djectCoreFactory;
    }

    container.register('containerFactory', containerFactory, []);
});
