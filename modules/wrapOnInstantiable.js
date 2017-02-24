'use strict';

function isMetadataKey (key) {
    return key.match(/^\@.*$/) !== null;
}

function applyMetadata (InstantiableObj, InstantiableFactory) {
    Object.keys(InstantiableObj).filter(isMetadataKey).forEach(function (key) {
        InstantiableFactory[key] = InstantiableObj[key];
    });

    return InstantiableFactory;
}

function wrapInstantiable (InstantiableObj) {
    function InstantiableFactory () {
        var dependencies = Array.prototype.slice.call(arguments, 0);
        var newObj = Object.create(InstantiableObj.prototype);

        InstantiableObj.apply(newObj, dependencies);

        return newObj;
    }

    return applyMetadata(InstantiableObj, InstantiableFactory);
}

function wrapOnInstantiable (module) {
    return module['@instantiable'] ? wrapInstantiable(module) : module;
}

module.exports = wrapOnInstantiable;