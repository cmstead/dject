(function (functionHelperFactory) {
    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    if (isNode) {
        module.exports = functionHelperFactory();
    } else {
        window.djectFunctionHelper = functionHelperFactory();
    }

})(function () {
    'use strict';

    function getArgStr(fn) {
        return fn.toString().match(/function\s.*?\(([^)]*)\)/)[1];
    }

    function getParamNames(fn) {
        return getArgStr(fn)
            .replace(/\/\*.*\*\//, '')
            .split(',')
            .map(function (paramName) { return paramName.trim(); })
            .filter(function (paramName) { return paramName.length > 0; });
    }

    return {
        getParamNames: getParamNames
    };
});
