/* global djectFunctionHelper */

(function (setDefaultsFactory) {
    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    if (isNode) {
        var functionHelper = require('./functionHelper');

        module.exports = setDefaultsFactory(functionHelper);
    } else {
        window.setDjectDefaults = setDefaultsFactory(djectFunctionHelper);
    }

})(function (functionHelper) {
    'use strict';

    function checkPropOn(module) {
        return function (propName) {
            return typeof module[propName] !== 'undefined';
        };
    }

    function getPropOrDefaultOn(module) {
        var hasProp = checkPropOn(module);

        return function (propName, defaultProp) {
            return hasProp(propName) ? module[propName] : defaultProp;
        }
    }

    function setDefaults(module) {
        var getPropOrDefault = getPropOrDefaultOn(module);

        module['@name'] = getPropOrDefault('@name', module.name);
        module['@instantiable'] = getPropOrDefault('@instantiable', false);
        module['@singleton'] = getPropOrDefault('@singleton', false);
        module['@dependencies'] = getPropOrDefault('@dependencies', functionHelper.getParamNames(module));

        return module;
    }

    return setDefaults;
});


