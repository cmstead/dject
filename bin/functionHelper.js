(function (functionHelperFactory) {
    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    if (isNode) {
        module.exports = functionHelperFactory();
    } else {
        window.djectFunctionHelper = functionHelperFactory();
    }

})(function () {
    'use strict';

    function getFunctionName(fn) {
        return fn.name === ''
            ? 'anonymous'
            : fn.name;
    }

    function getArgStr(fn) {
        try {
            return fn.toString().match(/function\s.*?\(([^)]*)\)/)[1];
        } catch (e) {
            var message = typeof fn === 'function'
                ? 'Unable to parse arguments from function or expression: ' + getFunctionName(fn)
                : 'Cannot register module. Expected function, but got ' + typeof fn +
                ' with value ' + JSON.stringify(fn, null, 4);

            throw new Error(message);
        }
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
