'use strict'

const path = require('path');

var config = {
    cwd: path.join(__dirname, 'dependencies'),
    modulePaths: [
        '',
        'core',
        'document-tools',
        'interpreter'
    ],
    allowOverride: false,
    eagerLoad: false,
    errorOnModuleDNE: false
};

module.exports = require('dject').new(config);