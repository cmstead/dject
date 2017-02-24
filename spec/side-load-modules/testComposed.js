'use strict';

function testComposed(testBase, otherBase) {
    return {
        testBase: testBase,
        testOtherBase: otherBase
    };
}

testComposed['@name'] = 'testComposed';
testComposed['@dependencies'] = ['testBase', 'otherBase'];

module.exports = testComposed;