'use strict';

const fs = require('fs');
const container = require('../../container');

const parser = container.build('documentParser');

require('../utils/approvals')();

describe('Document Parser', function () {

    let sourceContent;

    beforeEach(function () {
        const cwd = process.cwd();
        const sourcePath = `${cwd}/tests/fixtures/document-parser.md`;
        sourceContent = fs.readFileSync(sourcePath, { encoding: 'utf8' });
    });

    it('parses a markdown file into consumable chunks', function () {
        const parsedDocument = parser.parse(sourceContent);
        this.verify(JSON.stringify(parsedDocument, null, 4));
    });
});
