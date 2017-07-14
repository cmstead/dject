'use strict'

var config = {
    cwd: './spec',
    modulePaths: [
        'side-load-modules',
        'testModules'
    ]
};

module.exports = require('../index').new(config);