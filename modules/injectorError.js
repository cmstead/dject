'use strict';

function InjectorError(message) {
    var localError = Error.apply(this, arguments);

    this.name = 'Injector Error';
    this.message = this.name + ': ' + message;

    Object.defineProperty(this, 'stack', {
        get: function () {
            return localError.stack;
        }
    });

    return this;
}

InjectorError.prototype = {
    toString: function () {
        return this.message;
    }
};

module.exports = InjectorError;