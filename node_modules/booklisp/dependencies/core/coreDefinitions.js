function coreDefinitions() {
    'use strict';

    return {
        "define!": function (key, value) {
            this._define(key, () => value);
        },

        dict: function (...args) {
            return args.reduce(function (fileMetadata, metaTuple) {
                const key = metaTuple[0];
                const value = metaTuple[1];

                fileMetadata[key] = value;

                return fileMetadata;
            }, {});
        },

        'set!': function (dict, key, value) {
            dict[key] = value;
            return dict;
        },

        get: function (dict, key, defaultValue) {
            return typeof dict[key] !== 'undefined' ? dict[key] : defaultValue;
        },

        tag: function (key, value) {
            return [key, value];
        }
    }
}

module.exports = coreDefinitions;