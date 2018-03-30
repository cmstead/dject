(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.fsLoader = loader;
    }

})(function (container) {
    'use strict';

    function fsFunctionFake() {
        throw new Error('Cannot load filesystem modules when not in NodeJS environmet');
    }

    function fsFactory() {
        const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

        const fsFake = {
            readdirSync: fsFunctionFake,
            lstatSync: fsFunctionFake
        };

        return isNode ? require('fs') : fsFake;
    }

    container.register('fs', fsFactory, []);
});
