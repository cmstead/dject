'use strict';

require('quokka-mocha-approvals-helper')();

const approvalsLocation = './test/approvals';
const approvalsConfigFactory = require('approvals-config-factory');
const approvalsConfig = approvalsConfigFactory.buildApprovalsConfig({
    reporter: chooseReporter('kdiff3')
});

module.exports = require('approvals')
    .configure(approvalsConfig)
    .mocha(approvalsLocation);
