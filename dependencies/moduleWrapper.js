(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleWrapperLoader = loader;
    }

})(function (container) {
    'use strict';

    function moduleWrapperFactory() {

        function copyProperties(moduleValue, wrappedModule) {
            wrappedModule['@dependencies'] = moduleValue['@dependencies'];
            wrappedModule['@instantiable'] = moduleValue['@instantiable'];
            wrappedModule['@singleton'] = moduleValue['@singleton'];

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

            return copyProperties(moduleValue, singletonFactory);
        }

        function wrapInstantiable(moduleValue) {
            function instantiableFactory() {
                const dependencies = Array.prototype.slice.call(arguments, 0);

                if (typeof moduleValue.build !== 'function') {
                    const instance = Object.create(moduleValue.prototype);

                    moduleValue.apply(instance, dependencies);

                    return instance;
                } else {
                    return moduleValue.build.call(null, dependencies);
                }
            }

            return copyProperties(moduleValue, instantiableFactory);
        }

        function isInstantiable (moduleValue) {
            return moduleValue['@instantiable']
            || typeof moduleValue.build === 'function';
        }

        function wrapSpecialModule(moduleValue) {
            let wrappedModule = isInstantiable(moduleValue)
                ? wrapInstantiable(moduleValue)
                : moduleValue;

            wrappedModule = wrappedModule['@singleton']
                ? wrapSingleton(wrappedModule)
                : wrappedModule;

            return wrappedModule;
        }

        return {
            wrapSpecialModule: wrapSpecialModule
        };

    }

    container.register('moduleWrapper', moduleWrapperFactory, []);

});
