'use strict';

const fs = require('fs');
const container = require('../../container');

const parser = container.build('documentParser');
const renderer = container.build('documentRenderer');

require('../utils/approvals')();

describe('Document Renderer', function () {

    let sourceContent;

    beforeEach(function () {
        const cwd = process.cwd();
        const sourcePath = `${cwd}/tests/fixtures/document-parser.md`;
        sourceContent = fs.readFileSync(sourcePath, { encoding: 'utf8' });
    });

    it('produces a compiled markdown string', function () {
        const parsedDocument = parser.parse(sourceContent);
        const compiledMarkdown = renderer.render(parsedDocument);

        this.verify(JSON.stringify(compiledMarkdown, null, 4));
    });
});
