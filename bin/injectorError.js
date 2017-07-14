(function (injectorErrorFactory) {
    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    if (isNode) {
        module.exports = injectorErrorFactory();
    } else {
        window.djectInjectorError = injectorErrorFactory();
    }

})(function () {
    'use strict';

    function InjectorError(message) {
        var localError = Error.apply(this, arguments);

        this.name = 'Injector Error';
        this.messageBody = message;

        Object.defineProperty(this, 'message', {
            get: function () {
                this.name + ': ' + this.messageBody
            }
        });

        Object.defineProperty(this, 'stack', {
            get: function () {
                return localError.stack;
            }
        });

        return this;
    }

    InjectorError.prototype = {
        toString: function () {
            return this.name + ': ' + this.messageBody;
        }
    };

    return InjectorError;
});

