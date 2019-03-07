'use strict';

const fs = require('fs');
const container = require('../../container');

const parser = container.build('documentParser');

const coreEnvironmentFactory = container.build('coreEnvironmentFactory');
const coreDefinitions = container.build('coreDefinitions');
const extensionDefinitions = container.build('extensionDefinitions');

require('../utils/approvals')();

describe('Document Evaluator', function () {

    let sourceContent;
    let parsedDocument;

    beforeEach(function () {
        const cwd = process.cwd();
        const sourcePath = `${cwd}/tests/fixtures/document-parser.md`;
        sourceContent = fs.readFileSync(sourcePath, { encoding: 'utf8' });
        parsedDocument = parser.parse(sourceContent);
    });

    it('produces a document object', function () {
        const documentEnvironment = coreEnvironmentFactory()
            ._merge(coreDefinitions)
            ._merge(extensionDefinitions);

        const result = parsedDocument.evaluate(documentEnvironment);

        this.verify(JSON.stringify(result, null, 4));
    });
});
