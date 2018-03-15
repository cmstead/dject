(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.pathLoader = loader;
    }

})(function (container) {
    'use strict';

    // function pathFunctionFake() {
    //     throw new Error('Cannot load filesystem modules when not in NodeJS environmet');
    // }

    function pathFactory() {
        // var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

        // var pathFake = {
        //     join: pathFunctionFake
        // };
        
        // return isNode ? require('path') : pathFake;

        return require('path');
    }

    container.register('path', pathFactory, []);
});