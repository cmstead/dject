(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.globLoader = loader;
    }

})(function (container) {
    'use strict';

    function globFunctionFake() {
        throw new Error('Cannot load filesystem modules when not in NodeJS environmet');
    }

    function globFactory() {
        const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

        function globFake() {
            globFunctionFake();
        }

        globFake.sync = globFunctionFake;

        return isNode ? require('glob') : globFake;
    }

    container.register('glob', globFactory, []);
});
