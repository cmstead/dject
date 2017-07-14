'use strict';

function testComposed(testBase, otherBase) {
    return {
        testBase: testBase,
        testOtherBase: otherBase
    };
}

module.exports = testComposed;