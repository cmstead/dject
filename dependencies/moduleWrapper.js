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
            let generatedModule = null;

            function buildModule(args) {
                const dependencies = Array.prototype.slice.call(args, 0);
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
                const dependencies = Array.prototype.slice.call(arguments, 0);

                if (typeof moduleValue.build !== 'function') {
                    const instance = Object.create(moduleValue.prototype);

                    moduleValue.apply(instance, dependencies);

                    return instance;
                } else {
                    moduleValue.build.apply(null, dependencies);
                }
            }

            instantiableFactory['@instantiable'] = true;
            instantiableFactory['@dependencies'] = moduleValue['@dependencies'];

            return instantiableFactory;
        }

        function wrapSpecialModule(moduleValue) {
            if (moduleValue['@singleton']) {
                return wrapSingleton(moduleValue);
            } else if (moduleValue['@instantiable']
                || typeof moduleValue.build === 'function') {
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
