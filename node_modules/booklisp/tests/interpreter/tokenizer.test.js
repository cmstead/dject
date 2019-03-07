'use strict';

const fs = require('fs');
const container = require('../../container');

const tokenizer = container.build('tokenizer');

require('../utils/approvals')();

describe('tokenizer', function () {

    let filemetaSource;

    beforeEach(function () {
        const cwd = process.cwd();
        const sourceFilePath = `${cwd}/tests/fixtures/filemeta.bl`;

        filemetaSource = fs.readFileSync(sourceFilePath, { encoding: 'utf8' });
    });

    
    describe('tokenize', function () {
        
        it('tokenizes filemeta source correctly', function() {
            const filemetaTokens = tokenizer.tokenize(filemetaSource);

            this.verify(JSON.stringify(filemetaTokens, null, 4));
        });

    });   
    
});