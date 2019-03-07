'use strict';

const approvals = require('approvals');
const approvalsConfigFactory = require('approvals-config-factory');

const approvalsDirectory = './tests/approvals';

const approvalsConfig = approvalsConfigFactory.buildApprovalsConfig({
    reporter: 'kdiff3'
});

module.exports = () => approvals.configure(approvalsConfig).mocha(approvalsDirectory);