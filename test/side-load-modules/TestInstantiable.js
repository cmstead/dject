'use strict';

function TestInstantiable (testBase, otherBase) {
    this.objs = {
        testBase: testBase,
        otherBase: otherBase
    };
}

TestInstantiable.prototype = {
    getObjs: function () {
        return this.objs;
    },

    toString: function () {
        return 'TestInstantiableInstance: \n' + JSON.stringify(this.objs, null, 4);
    }
};

TestInstantiable['@instantiable'] = true;

module.exports = TestInstantiable;
