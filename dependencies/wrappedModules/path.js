(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.pathLoader = loader;
    }

})(function (container) {
    'use strict';

    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    function pathFactory() {
        return isNode ? require('path') : null;
    }

    container.register('path', pathFactory, []);
});
