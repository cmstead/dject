function bireferenceDict() {
    'use strict';

    function bireferenceDict(values) {
        return values.reduce(function (result, value, index) {
            result[value] = index;
            result[index] = value;

            return result;
        }, {});
    }

    return bireferenceDict;
}

module.exports = bireferenceDict;