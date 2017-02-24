'use strict';

function testBase() {
    return {
        foo: 'bar',
        baz: 'quux'
    }
}

testBase['@name'] = 'testBase';

module.exports = testBase;