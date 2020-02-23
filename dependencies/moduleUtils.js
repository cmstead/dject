(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleUtilsLoader = loader;
    }

})(function (container) {
    'use strict';

    function moduleUtilsFactory() {

        function getModuleName(moduleInstance) {
            const predefinedName = moduleInstance['@name'];
            return typeof predefinedName === 'string' ? predefinedName : moduleInstance.name;
        }

        function getFunctionArgs(fn) {
            const functionSource = fn.toString();
            const baseFunctionMatch = functionSource.match(/function\s.*?\(([^)]*)\)/);

            if (baseFunctionMatch !== null) {
                return baseFunctionMatch[1];
            } else {
                return functionSource.match(/.*\(([^)]*)\)\s*\=\>/)[1];
            }
        }

        function getArgStr(fn) {
            try {
                return getFunctionArgs(fn);
            } catch (e) {
                const message = 'Unable to parse arguments from function or expression: ' + getModuleName(fn);
                throw new Error(message);
            }
        }

        function throwOnBadFunction(fn) {
            const message = 'Cannot register module. Expected function, but got ' + typeof fn +
            ' with value ' + JSON.stringify(fn, null, 4);

            if(typeof fn !== 'function'){
                throw new Error(message);
            }
        }

        function buildModuleDependencyList(fn) {
            return getArgStr(fn)
            .replace(/\/\*.*\*\//, '')
            .split(',')
            .map(function (paramName) { return paramName.trim(); })
            .filter(function (paramName) { return paramName.length > 0; });
        }

        function getModuleDependencies(fn) {
            throwOnBadFunction(fn);

            if(typeof fn['@dependencies'] === 'object') {
                return fn['@dependencies'];
            } else if(typeof fn.dependencies === 'function') {
                return fn.dependencies();
            } else {
                return buildModuleDependencyList(fn);
            }
        }

        function getModuleInfo(moduleValue, moduleName) {
            const dependencies = getModuleDependencies(moduleValue);

            const name = typeof moduleName === 'string'
                ? moduleName
                : getModuleName(moduleValue);

            return {
                dependencies: dependencies,
                name: name
            };
        }

        return {
            getModuleDependencies: getModuleDependencies,
            getModuleName: getModuleName,
            getModuleInfo: getModuleInfo
        };

    }

    container.register('moduleUtils', moduleUtilsFactory, []);
});
