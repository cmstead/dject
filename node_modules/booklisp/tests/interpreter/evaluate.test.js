'use strict';

const container = require('../../container');

const fs = require('fs');

const parser = container.build('parser');
const coreEnvironmentFactory = container.build('coreEnvironmentFactory');
const coreDefinitions = container.build('coreDefinitions');
const extensionDefinitions = container.build('extensionDefinitions');

require('../utils/approvals')();

describe('evaluate', function () {

    let filemetaSource;
    let filemetaAST;

    beforeEach(function () {
        const cwd = process.cwd();
        const sourceFilePath = `${cwd}/tests/fixtures/filemeta.bl`;

        filemetaSource = fs.readFileSync(sourceFilePath, { encoding: 'utf8' });
        filemetaAST = parser.parse(filemetaSource);
    });

    
    describe('AST evaluate', function () {

        it('runs evaluate on a single execution path', function () {
            const startingEnvironment = coreEnvironmentFactory()
                ._merge(coreDefinitions)
                ._merge(extensionDefinitions);

            const result = filemetaAST.evaluate(startingEnvironment);

            this.verify(JSON.stringify(result, null, 4));
        });

    });
    
});