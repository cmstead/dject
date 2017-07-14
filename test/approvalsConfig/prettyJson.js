(function () {
    'use strict';

    function getFunctionName(value) {
        var functionName = value.name === '' ? 'anonymous function' : value.name;
        return 'Function: ' + functionName;
    }

    function functionToName(value) {
        return typeof value === 'function' ? getFunctionName(value) : value;
    }

    function preprocessValues(key, value) {
        return functionToName(value);
    }

    function prettyJson(value) {
        return JSON.stringify(value, preprocessValues, 4);
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = prettyJson;
    } else {
        window.prettyJson = prettyJson;
    }

})();
