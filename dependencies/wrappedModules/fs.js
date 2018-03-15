(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.fsLoader = loader;
    }

})(function (container) {
    'use strict';

    function fsFake() {
        throw new Error('Cannot load filesystem modules when not in NodeJS environmet');
    }

    function fsFactory() {
        var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
        return isNode ? require('fs') : fsFake;
    }

    container.register('fs', fsFactory, []);
});