function tokenizer() {
    'use strict';

    const newlinePattern = /^\r?\n?$/;
    const bracketPattern = /[[\]()]/;

    function isTerminatorPattern(currentChar) {
        return bracketPattern.test(currentChar)
            || newlinePattern.test(currentChar)
            || currentChar === ' '
            || currentChar === '"';
    }

    function tokenize(source) {
        let tokens = [];

        let currentToken = '';
        let insideString = false;

        for (let i = 0; i < source.length; i++) {
            const currentChar = source[i];

            if (currentChar === '"') {
                currentToken += '"';
                insideString = !insideString;
            }

            if (currentChar === '\\') {
                i++;
                currentToken += '\\' + source[i];
                continue;
            }

            if (currentToken !== '' && !insideString && isTerminatorPattern(currentChar)) {
                tokens.push(currentToken);
                currentToken = '';
            }

            if (newlinePattern.test(currentChar)
                || (currentToken === '' && currentChar === ' ')
                || currentChar === '"') {
                continue;
            }

            if (bracketPattern.test(currentChar) && !insideString) {
                tokens.push(currentChar);
            } else {
                currentToken += currentChar;
            }
        }

        return tokens;
    }

    return {
        tokenize: tokenize
    }
}

module.exports = tokenizer;