(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleLoaderLoader = loader;
    }

})(function (container) {

    function moduleLoaderFactory() {

        function caseFromCamelToKebab(moduleName) {
            return moduleName.replace(/([A-Z])/g, '-$1');
        }

        function loadInstalledModule(moduleName) {
            var moduleKebabName = caseFromCamelToKebab(moduleName);

            try {
                return require(moduleKebabName);
            } catch (e) {
                return null;
            }
        }

        return {
            loadInstalledModule: loadInstalledModule
        };
    }

    container.register('moduleLoader', moduleLoaderFactory, []);

});
