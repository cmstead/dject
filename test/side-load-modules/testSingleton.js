'use strict';

function testSingleton (testComposed) {
    return {
        testComposed: testComposed
    };
}

testSingleton['@dependencies'] = ['testComposed'];
testSingleton['@singleton'] = true;

module.exports = testSingleton;