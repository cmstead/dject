(function (loader) {

    if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleUtilsLoader = loader;
    }

})(function (container) {
    'use strict';
    
    function moduleUtilsFactory() {

        function getModuleName(moduleInstance) {
            var predefinedName = moduleInstance['@name'];
            return typeof predefinedName === 'string' ? predefinedName : moduleInstance.name;
        }

        function getModuleDependencies () {
            return [];
        }

        return {
            getModuleDependencies: getModuleDependencies,
            getModuleName: getModuleName
        };

    }

    container.register('moduleUtils', moduleUtilsFactory, []);
});