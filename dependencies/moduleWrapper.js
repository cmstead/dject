(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleWrapperLoader = loader;
    }

})(function (container) {
    'use strict';

    function moduleWrapperFactory() {

        function carryDependencyListForward(moduleValue, wrappedModule) {
            wrappedModule['@dependencies'] = moduleValue['@dependencies'];

            return wrappedModule;
        }

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

            return carryDependencyListForward(moduleValue, singletonFactory);
        }

        function wrapInstantiable(moduleValue) {
            function instantiableFactory() {
                const dependencies = Array.prototype.slice.call(arguments, 0);

                const moduleDoesNotHaveBuildMethod = typeof moduleValue.build !== 'function';

                if (moduleDoesNotHaveBuildMethod) {
                    return new moduleValue(...dependencies);
                } else {
                    return moduleValue.build(...dependencies);
                }
            }

            return carryDependencyListForward(moduleValue, instantiableFactory);
        }

        function isInstantiable(moduleValue) {
            return moduleValue['@instantiable']
                || typeof moduleValue.build === 'function';
        }

        function isSingleton(moduleValue) {
            return Boolean(moduleValue['@singleton']);
        }

        function wrapSpecialModule(moduleValue) {
            let wrappedModule = moduleValue;

            if (isInstantiable(moduleValue)) {
                wrappedModule = wrapInstantiable(moduleValue);
            }

            if (isSingleton(moduleValue)) {
                wrappedModule = wrapSingleton(wrappedModule);
            }

            return wrappedModule;
        }

        return {
            wrapSpecialModule: wrapSpecialModule
        };

    }

    container.register('moduleWrapper', moduleWrapperFactory, []);

});
