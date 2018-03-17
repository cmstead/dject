(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleWrapperLoader = loader;
    }

})(function (container) {
    'use strict';

    function moduleWrapperFactory() {

        function wrapSingleton(moduleValue) {
            var generatedModule = null;

            function buildModule(args) {
                var dependencies = Array.prototype.slice.call(args, 0);
                return moduleValue.apply(null, dependencies);
            }

            function singletonFactory() {
                generatedModule = generatedModule === null
                    ? buildModule(arguments)
                    : generatedModule;

                return generatedModule;
            }

            singletonFactory['@singleton'] = true;
            singletonFactory['@dependencies'] = moduleValue['@dependencies'];

            return singletonFactory;
        }

        function wrapInstantiable(moduleValue) {
            function instantiableFactory() {
                var dependencies = Array.prototype.slice.call(arguments, 0);
                var instance = Object.create(moduleValue.prototype);

                moduleValue.apply(instance, dependencies);

                return instance;
            }

            instantiableFactory['@instantiable'] = true;
            instantiableFactory['@dependencies'] = moduleValue['@dependencies'];

            return instantiableFactory;
        }

        function wrapSpecialModule(moduleValue) {
            if (moduleValue['@singleton']) {
                return wrapSingleton(moduleValue);
            } else if (moduleValue['@instantiable']) {
                return wrapInstantiable(moduleValue);
            } else {
                return moduleValue;
            }
        }

        return {
            wrapSpecialModule: wrapSpecialModule
        };

    }

    container.register('moduleWrapper', moduleWrapperFactory, []);

});