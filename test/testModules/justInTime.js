'use strict';

function justInTime (testComposed) {
    return {
        testComposed: testComposed
    };
}

justInTime['@dependencies'] = ['testComposed'];

module.exports = justInTime;