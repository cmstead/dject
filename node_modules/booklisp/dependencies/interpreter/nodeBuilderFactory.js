function nodeBuilderFactory(
    nodeTypes
) {
    'use strict';

    function nodeBuilderFactory(lex) {
        function buildNode(nodeType) {
            const localNode = {
                type: nodeTypes[nodeType],
                value: null,
                childNodes: [],
                evaluate: function (environment) {
                    const nodeType = nodeTypes[localNode.type];
                    const results = localNode.childNodes.map(node => node.evaluate(environment._clone()));

                    return environment._get(nodeType).call(environment, localNode, results);
                }
            };

            return localNode;
        }

        function buildFunctionNode(sourceTokens) {
            const functionNode = buildNode(nodeTypes.ExecutionBlock);

            functionNode.childNodes = lex(sourceTokens);

            return functionNode;
        }

        function buildVectorNode(sourceTokens) {
            const functionNode = buildNode(nodeTypes.VectorBlock);

            functionNode.childNodes = lex(sourceTokens);

            return functionNode;
        }

        function sanitizeString(stringToken) {
            return stringToken.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
        }

        function buildValueNode(nodeType, token) {
            const valueNode = buildNode(nodeType);

            if (nodeType === nodeTypes.String) {
                valueNode.value = sanitizeString(token);
            } else if (nodeType === nodeTypes.Number) {
                valueNode.value = Number(token);
            } else if (nodeType === nodeTypes.Boolean) {
                valueNode.value = token === 'True';
            } else {
                valueNode.value = token;
            }

            return valueNode;
        }

        return {
            buildNode: buildNode,
            buildFunctionNode: buildFunctionNode,
            buildValueNode: buildValueNode,
            buildVectorNode: buildVectorNode
        };
    }

    return nodeBuilderFactory;
}

module.exports = nodeBuilderFactory;