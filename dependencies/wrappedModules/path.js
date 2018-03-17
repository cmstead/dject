(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.pathLoader = loader;
    }

})(function (container) {
    'use strict';

    function pathFactory() {
        return require('path');
    }

    container.register('path', pathFactory, []);
});