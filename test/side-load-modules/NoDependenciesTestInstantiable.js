'use strict';

function NoDependenciesTestInstantiable () {
    this.state = {};
}

NoDependenciesTestInstantiable.prototype = {
    add: function (key, value) {
        this.state[key] = value;
        return this;
    },

    get: function(key) {
        return this.state[key];
    }
};

NoDependenciesTestInstantiable['@instantiable'] = true;

module.exports = NoDependenciesTestInstantiable;
