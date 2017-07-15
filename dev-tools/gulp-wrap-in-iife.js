'use strict';

const Buffer = require('buffer').Buffer;
const through = require('through2');

function WrapInIIFETransform(file, encoding, done) {
    const tabbedStr = String(file.contents)
        .split('\n')
        .map(token => '\t' + token)
        .join('\n');

    const result = `(function() {\n\t${tabbedStr}\n})();`;

    file.contents = new Buffer(result);
    this.push(file);

    return done();
}

function gulpWrapInIIFE() {
    return through.obj(WrapInIIFETransform);
}

module.exports = gulpWrapInIIFE;
