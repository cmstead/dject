'use strict';

var functionHelper = require('./functionHelper');

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
    module['@dependencies'] = getPropOrDefault('@dependencies', functionHelper.getParamNames(module));

    return module;
}

module.exports = setDefaults;