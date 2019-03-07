function coreEnvironmentFactory(nodeTypes) {
    'use strict';

    return function () {
        return {
            [nodeTypes.Executable]: function (node, args) {
                return args;
            },

            [nodeTypes.ExecutionBlock]: function (node, args) {
                const callable = args[0];
                const argValues = args.slice(1).map((value) => {
                    return typeof value === 'function' ? value.call(this) : value;
                });

                let result;

                if (typeof callable === 'undefined') {
                    throw new Error(`Unable to locate function associated with identifier ${args[0]}`);
                }

                result = callable.apply(this, argValues);

                return result;
            },

            [nodeTypes.VectorBlock]: function (node, args) {
                return args;
            },

            [nodeTypes.Boolean]: function (node, args) {
                return node.value;
            },

            [nodeTypes.Identifier]: function (node, args) {
                return this._get(node.value);
            },

            [nodeTypes.String]: function (node, args) {
                return node.value;
            },

            [nodeTypes.Number]: function (node, args) {
                return node.value;
            },

            _clone: function () {
                let clonedEnvironment = Object
                    .keys(this)
                    .reduce((environment, key) => {
                        environment[key] = this[key];
                        return environment;
                    }, {});

                clonedEnvironment._define = (key, value) => this._define(key, value);
                clonedEnvironment._parent = this;

                return clonedEnvironment;
            },

            _get: function (key) {
                if (typeof this[key] !== 'undefined') {
                    return this[key];
                } else if (this._parent !== null) {
                    return this._parent._get(key);
                } else {
                    return undefined;
                }
            },

            _set: function (key, value) {
                if (typeof this[key] !== 'undefined') {
                    throw new Error(`Identifier '${key}' has already been set.`);
                } if (typeof key === 'number') {
                    throw new Error('Identifiers cannot be numbers');
                }

                this[key] = value;

                return this;
            },

            _merge: function (extendedEnvironment) {
                return Object
                    .keys(extendedEnvironment)
                    .reduce((environment, key) => {
                        return environment._set(key, extendedEnvironment[key]);
                    }, this._clone());
            },

            _define: function (key, value) {
                return this._set(key, value);
            },

            _parent: null
        }
    };
}

module.exports = coreEnvironmentFactory;