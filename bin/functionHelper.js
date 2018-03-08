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

    function getFunctionArgs(fn) {
        var functionSource = fn.toString();
        var baseFunctionMatch = functionSource.match(/function\s.*?\(([^)]*)\)/);

        if (baseFunctionMatch !== null) {
            return baseFunctionMatch[1];
        } else {
            return functionSource.match(/.*\(([^)]*)\)\s*\=\>/)[1];
        }
    }

    function getArgStr(fn) {
        try {
            return getFunctionArgs(fn);
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
