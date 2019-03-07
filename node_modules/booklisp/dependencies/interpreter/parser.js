function parser(
    lexer,
    nodeTypes,
    nodeBuilderFactory,
    tokenizer
) {
    'use strict';

    const { lex } = lexer;
    const nodeBuilder = nodeBuilderFactory(lex);

    function parse(source) {
        const sourceTokens = tokenizer.tokenize(source);
        const executableNode = nodeBuilder.buildNode(nodeTypes.Executable);

        executableNode.childNodes = lex(sourceTokens);

        return executableNode;
    }

    return {
        parse: parse
    }
}

module.exports = parser;