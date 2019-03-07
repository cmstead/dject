
function nodeTypes(bireferenceDict) {
    'use strict';

    return bireferenceDict([
        'Executable',
        'ExecutionBlock',
        'VectorBlock',
        'Boolean',
        'Identifier',
        'String',
        'Number'
    ]);

}

module.exports = nodeTypes;