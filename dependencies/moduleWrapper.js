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

            function singletonFactory () {
                generatedModule = generatedModule === null
                    ? buildModule(arguments)
                    : generatedModule;
                
                return generatedModule;
            }

            singletonFactory['@singleton'] = true;

            return singletonFactory;
        }

        function wrapSpecialModule(moduleValue) {
            if(moduleValue['@singleton']) {
                return wrapSingleton(moduleValue);
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