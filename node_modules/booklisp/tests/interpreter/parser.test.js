'use strict';

const container = require('../../container');

const fs = require('fs');

const parser = container.build('parser');

require('../utils/approvals')();

describe('parser', function () {

    let filemetaSource;

    beforeEach(function () {
        const cwd = process.cwd();
        const sourceFilePath = `${cwd}/tests/fixtures/filemeta.bl`;

        filemetaSource = fs.readFileSync(sourceFilePath, { encoding: 'utf8' });
    });

    
    describe('parse', function () {

        it('generates an AST from a source string', function () {
            const filemetaAST = parser.parse(filemetaSource);

            this.verify(JSON.stringify(filemetaAST, null, 4));
        });

    });
    
});