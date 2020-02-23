(function (djectCoreFactory) {
    'use strict';

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = djectCoreFactory;
    } else {
        window.djectCoreFactory = djectCoreFactory;
    }
})(function () {

    var registry = {};
    var api = {};

    function isRegistered(moduleName) {
        return typeof registry[moduleName] !== 'undefined';
    }

    function throwOnUnregistered(moduleName) {
        if (!isRegistered(moduleName)) {
            throw new Error('Module ' + moduleName + ' has not been registered');
        }
    }

    function throwOnImproperOverride(moduleName) {
        if (!isRegistered(moduleName)) {
            throw new Error('Cannot override module, ' + moduleName + '; it has not been registered');
        }
    }

    function build(moduleName) {
        throwOnUnregistered(moduleName);
        return registry[moduleName]();
    }

    function buildWithObject(moduleName) {
        throwOnUnregistered(moduleName);
        return registry[moduleName].buildWithObject();
    }

    function set(obj, key, value) {
        obj[key] = value;
        return obj;
    }

    function createBuilder(moduleFactory, dependencies) {
        function moduleBuilder() {
            return moduleFactory.apply(null, dependencies.map(build));
        }

        function buildModuleWithObject() {
            var dependencyInstances = dependencies.map(buildWithObject);

            var dependencyMap = dependencies.reduce(function (result, dependencyName, index) {
                result[dependencyName] = dependencyInstances[index];
                return result;
            }, {});

            return moduleFactory(dependencyMap);
        }

        function getDependencies() {
            return dependencies.slice(0);
        }

        Object.defineProperty(moduleBuilder, 'originalModule', {
            value: moduleFactory,
            writeable: false,
            configurable: false
        });

        Object.defineProperty(moduleBuilder, 'buildWithObject', {
            value: buildModuleWithObject,
            writeable: false,
            configurable: false
        });

        return set(moduleBuilder, 'dependencies', getDependencies);
    }

    function throwOnRegistered(moduleName) {
        if (isRegistered(moduleName)) {
            throw new Error('Cannot reregister module ' + moduleName);
        }
    }

    function registerModule(moduleName, moduleFactory, dependencies) {
        registry[moduleName] = createBuilder(moduleFactory, dependencies);
        return api;
    }

    function register(moduleName, moduleFactory, dependencies) {
        throwOnRegistered(moduleName);
        return registerModule(moduleName, moduleFactory, dependencies);
    }

    function override(moduleName, moduleFactory, dependencies) {
        throwOnImproperOverride(moduleName);
        return registerModule(moduleName, moduleFactory, dependencies);
    }

    function attachRegistryKey(outputRegistry, key) {
        return set(outputRegistry, key, registry[key]);
    }

    function getModuleRegistry() {
        return Object.keys(registry).reduce(attachRegistryKey, {});
    }

    function getDependencies(moduleName) {
        throwOnUnregistered(moduleName);

        return registry[moduleName].dependencies();
    }

    function getModuleBuilder(moduleName) {
        return registry[moduleName];
    }

    api.build = build;
    api.buildWithObject = buildWithObject;
    api.getModuleBuilder = getModuleBuilder;
    api.getModuleRegistry = getModuleRegistry;
    api.isRegistered = isRegistered;
    api.getDependencies = getDependencies;
    api.override = override;
    api.register = register;

    return api;
});
(function () {
    window.djectLoaders = {};
})();
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.baseUtilsLoader = loader;
    }
})(function (container) {
    'use strict';

    function throwOnBadConfig(config) {
        if (typeof config === 'undefined') {
            throw new Error('Dject requires a configuration object');
        }
    }

    function performEagerLoad(eagerLoad, modulePaths, registry) {
        if (eagerLoad) {
            registry.registerAllModulesFromPaths(modulePaths);
        }
    }

    function valueOrDefault(value, defaultValue) {
        return Boolean(value) ? value : defaultValue;
    }

    function buildLocalConfig(config) {
        var localConfig = Object.create(config);

        localConfig.allowOverride = valueOrDefault(config.allowOverride, false);
        localConfig.eagerLoad = valueOrDefault(config.eagerLoad, false);
        localConfig.errorOnModuleDNE = valueOrDefault(config.errorOnModuleDNE, false);
        localConfig.dependenciesAsObject = valueOrDefault(config.dependenciesAsObject, false);

        return localConfig;
    }

    function baseUtilsFactory(glob, path) {

        function getModulePathsArray(config) {
            return typeof config.modulePaths !== 'undefined' ? config.modulePaths.map(function (modulePath) {
                return path.join(config.cwd, modulePath);
            }) : [];
        }

        var jsPattern = /^.+\.js$/;

        function buildGlobPath(pathValue) {
            if (jsPattern.test(pathValue)) {
                return pathValue;
            } else {
                return pathValue + path.sep + '*.js';
            }
        }

        function buildAllModulePaths(modulePaths) {
            var globbedPaths = modulePaths.map(buildGlobPath).map(function (globPath) {
                return glob.sync(globPath);
            }).reduce(function (currentPaths, newPaths) {
                return currentPaths.concat(newPaths);
            }, []);

            return globbedPaths;
        }

        function buildModulePaths(config) {
            var modulePathsArray = getModulePathsArray(config);

            return buildAllModulePaths(modulePathsArray);
        }

        return {
            buildLocalConfig: buildLocalConfig,
            buildModulePaths: buildModulePaths,
            throwOnBadConfig: throwOnBadConfig,
            performEagerLoad: performEagerLoad
        };
    }

    container.register('baseUtils', baseUtilsFactory, ['glob', 'path']);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.containerFactoryLoader = loader;
    }
})(function (container) {
    'use strict';

    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
    var djectCoreFactory = isNode ? require('dject-core') : window.djectCoreFactory;

    function containerFactory() {
        return djectCoreFactory;
    }

    container.register('containerFactory', containerFactory, []);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.djectLoader = loader;
    }
})(function djectLoader(container) {
    'use strict';

    function djectFactory(baseUtils, containerFactory, fileLoader, moduleBuilderFactory, moduleLoader, moduleUtils, registryFactory) {

        function newContainer(config) {
            baseUtils.throwOnBadConfig(config);

            var localConfig = baseUtils.buildLocalConfig(config);
            var modulePaths = baseUtils.buildModulePaths(localConfig);

            var coreContainer = containerFactory();
            var registry = registryFactory(modulePaths, coreContainer);
            var moduleBuilder = moduleBuilderFactory(coreContainer, registry, localConfig);

            baseUtils.performEagerLoad(localConfig.eagerLoad, modulePaths, registry);

            function checkModuleDNE(moduleName) {
                return localConfig.errorOnModuleDNE && !fileLoader.isFileInPaths(modulePaths, moduleName) && moduleLoader.loadInstalledModule(moduleName) === null;
            }

            function throwIfModuleDNE(moduleName) {
                if (checkModuleDNE(moduleName)) {
                    var message = 'Cannot register module that does not exist in filesystem; errorOnModuleDNE is set to true';
                    throw new Error(message);
                }
            }

            function throwIfOverrideDisallowed() {
                if (!localConfig.allowOverride) {
                    var message = 'Cannot override module, allowOverride is set to false.';
                    throw new Error(message);
                }
            }

            function getLocalModuleName(moduleValue, moduleName) {
                return typeof moduleName === 'string' ? moduleName : moduleUtils.getModuleName(moduleValue);
            }

            function override(moduleValue, moduleName) {
                var localName = getLocalModuleName(moduleValue, moduleName);

                throwIfOverrideDisallowed();
                throwIfModuleDNE(localName);

                registry.override(moduleValue, localName);
            }

            function register(moduleValue, moduleName) {
                var localName = getLocalModuleName(moduleValue, moduleName);

                throwIfModuleDNE(localName);

                registry.registerModule(moduleValue, moduleName);
            }

            function buildChildConfig(config) {
                var childConfig = Object.create(config);
                childConfig.allowOverride = true;

                return childConfig;
            }

            function buildNew() {
                var childConfig = buildChildConfig(localConfig);
                var childContainer = newContainer(childConfig);
                var registeredModules = coreContainer.getModuleRegistry();

                Object.keys(registeredModules).forEach(function (moduleKey) {
                    if (moduleKey === '__container') {
                        return;
                    }

                    var moduleValue = registeredModules[moduleKey];
                    childContainer.register(moduleValue.originalModule, moduleKey);
                });

                return childContainer;
            }

            function getDependencyTree(moduleName) {
                registry.loadModule(moduleName);

                var moduleBuilder = registry.getModuleBuilder(moduleName);
                var dependencies = moduleBuilder.dependencies();

                return {
                    name: moduleName,
                    instantiable: Boolean(moduleBuilder['@instantiable']),
                    singleton: Boolean(moduleBuilder['@singleton']),
                    dependencies: dependencies.map(getDependencyTree)
                };
            }

            function buildDependencyMap(dependencyNames, injectedDependencies) {
                return dependencyNames.reduce(function (dependencyMap, dependencyName, index) {
                    dependencyMap[dependencyName] = injectedDependencies[index];

                    return dependencyMap;
                }, {});
            }

            function copyProps(destination, source) {
                Object.keys(source).forEach(function (key) {
                    if (typeof destination[key] === 'undefined') {
                        destination[key] = source[key];
                    }
                });

                return destination;
            }

            var containerApi = {
                build: moduleBuilder.build,
                buildDependencyMap: buildDependencyMap,
                copyProps: copyProps,
                getRegisteredModules: registry.getRegisteredModules,
                getDependencyTree: getDependencyTree,
                loadModule: registry.loadModule,
                new: buildNew,
                override: override,
                register: register,
                registerModules: registry.registerModules
            };

            registry.registerModule(function __container() {
                return containerApi;
            });

            return containerApi;
        }

        return {
            new: newContainer
        };
    }

    container.register('dject', djectFactory, ['baseUtils', 'containerFactory', 'fileLoader', 'moduleBuilderFactory', 'moduleLoader', 'moduleUtils', 'registryFactory']);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.fileLoaderLoader = loader;
    }
})(function (container) {

    function fileLoaderFactory(fs, glob, path) {

        function loadFileFromPath(filePath) {
            return function (fileName) {
                var fullPath = path.join(filePath, fileName);
                return require(fullPath);
            };
        }

        function isFileInPaths(modulePaths, moduleName) {
            var fileName = moduleName + '.js';

            var acceptedPaths = modulePaths.filter(function (filePath) {
                return filePath.endsWith(fileName);
            });

            return acceptedPaths.length > 0;
        }

        function loadFileFromPaths(modulePaths, moduleName) {
            var fileName = moduleName + '.js';
            var fileTestPattern = new RegExp('[\\/\\\\]' + moduleName + '\\.js$', 'i');

            var acceptedPaths = modulePaths.filter(function (filePath) {
                return fileTestPattern.test(filePath);
            });

            if (acceptedPaths.length > 1) {
                var message = 'Cannot load module, ' + moduleName + '; duplicate modules exist in the following paths: ' + acceptedPaths.join(',');
                throw new Error(message);
            }

            var filePath = acceptedPaths.length > 0 ? getFileFolder(acceptedPaths[0]) : null;

            return filePath !== null ? loadFileFromPath(filePath)(fileName) : null;
        }

        function getFileName(filePath) {
            var pathTokens = filePath.split(/[\/\\]/);

            return pathTokens.pop();
        }

        function getFileFolder(filePath) {
            var pathTokens = filePath.split(/[\/\\]/);
            var folderPathTokens = pathTokens.slice(0, pathTokens.length - 1);

            return folderPathTokens.join(path.sep);
        }

        function loadAllFilesFromPaths(modulePaths) {
            return modulePaths.map(function (filePath) {
                var fileName = getFileName(filePath);
                var folderName = getFileFolder(filePath);

                return loadFileFromPath(folderName)(fileName);
            });
        }

        return {
            isFileInPaths: isFileInPaths,
            loadFileFromPaths: loadFileFromPaths,
            loadAllFilesFromPaths: loadAllFilesFromPaths
        };
    }

    container.register('fileLoader', fileLoaderFactory, ['fs', 'glob', 'path']);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleBuilderFactoryLoader = loader;
    }
})(function (container) {
    'use strict';

    function moduleBuilderFactoryBuilder() {
        return function (coreContainer, registry, config) {

            function loadModuleIfMissing(moduleName) {
                if (!coreContainer.isRegistered(moduleName)) {
                    registry.loadModule(moduleName);
                }
            }

            function loadDependencies(moduleName) {
                var dependencies = coreContainer.getDependencies(moduleName);

                dependencies.forEach(function (moduleName) {
                    loadModuleIfMissing(moduleName);
                    loadDependencies(moduleName);
                });
            }

            function buildModule(moduleName) {
                loadModuleIfMissing(moduleName);
                loadDependencies(moduleName);

                return config.dependenciesAsObject ? coreContainer.buildWithObject(moduleName) : coreContainer.build(moduleName);
            }

            function build(moduleName) {
                try {
                    return buildModule(moduleName);
                } catch (e) {
                    var message = 'An error occurred while processing dependencies: ' + e.message;
                    throw new Error(message);
                }
            }

            return {
                build: build
            };
        };
    }

    container.register('moduleBuilderFactory', moduleBuilderFactoryBuilder, []);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.moduleLoaderLoader = loader;
    }
})(function (container) {

    function moduleLoaderFactory() {

        function caseFromCamelToKebab(moduleName) {
            return moduleName.replace(/([A-Z])/g, '-$1').toLowerCase();
        }

        function loadInstalledModule(moduleName) {
            var moduleKebabCaseName = caseFromCamelToKebab(moduleName);

            try {
                return require(moduleKebabCaseName);
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
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
            var predefinedName = moduleInstance['@name'];
            return typeof predefinedName === 'string' ? predefinedName : moduleInstance.name;
        }

        function getFunctionArgs(fn) {
            var functionSource = fn.toString();
            var baseFunctionMatch = functionSource.match(/function\s.*?\(([^)]*)\)/);

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
                var message = 'Unable to parse arguments from function or expression: ' + getModuleName(fn);
                throw new Error(message);
            }
        }

        function throwOnBadFunction(fn) {
            var message = 'Cannot register module. Expected function, but got ' + (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) + ' with value ' + JSON.stringify(fn, null, 4);

            if (typeof fn !== 'function') {
                throw new Error(message);
            }
        }

        function buildModuleDependencyList(fn) {
            return getArgStr(fn).replace(/\/\*.*\*\//, '').split(',').map(function (paramName) {
                return paramName.trim();
            }).filter(function (paramName) {
                return paramName.length > 0;
            });
        }

        function getModuleDependencies(fn) {
            throwOnBadFunction(fn);

            if (_typeof(fn['@dependencies']) === 'object') {
                return fn['@dependencies'];
            } else if (typeof fn.dependencies === 'function') {
                return fn.dependencies();
            } else {
                return buildModuleDependencyList(fn);
            }
        }

        function getModuleInfo(moduleValue, moduleName) {
            var dependencies = getModuleDependencies(moduleValue);

            var name = typeof moduleName === 'string' ? moduleName : getModuleName(moduleValue);

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
                generatedModule = generatedModule === null ? buildModule(arguments) : generatedModule;

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
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.registryLoader = loader;
    }
})(function (container) {
    'use strict';

    function registryFactoryBuilder(fileLoader, moduleLoader, moduleUtils, moduleWrapper) {

        return function (modulePaths, coreContainer) {

            function registerModule(moduleValue, moduleName) {
                var moduleInfo = moduleUtils.getModuleInfo(moduleValue, moduleName);
                var dependencies = moduleInfo.dependencies;
                var name = moduleInfo.name;

                var wrappedModule = moduleWrapper.wrapSpecialModule(moduleValue);

                coreContainer.register(name, wrappedModule, dependencies);
            }

            function override(moduleValue, moduleName) {
                var moduleInfo = moduleUtils.getModuleInfo(moduleValue, moduleName);
                var dependencies = moduleInfo.dependencies;
                var name = moduleInfo.name;

                var wrappedModule = moduleWrapper.wrapSpecialModule(moduleValue);

                coreContainer.override(name, wrappedModule, dependencies);
            }

            function registerModules(moduleValues) {
                moduleValues.forEach(registerModule);
            }

            function loadModuleFromFileSystem(modulePaths, moduleName) {
                var moduleInstance = fileLoader.loadFileFromPaths(modulePaths, moduleName);

                if (moduleInstance !== null) {
                    registerModule(moduleInstance);
                }
            }

            function loadModuleFromInstalledModules(moduleName) {
                var moduleInstance = moduleLoader.loadInstalledModule(moduleName);

                function moduleFactory() {
                    return moduleInstance;
                }

                if (moduleInstance !== null) {
                    registerModule(moduleFactory, moduleName);
                }
            }

            function loadModule(moduleName) {
                if (!coreContainer.isRegistered(moduleName)) {
                    loadModuleFromFileSystem(modulePaths, moduleName);
                }

                if (!coreContainer.isRegistered(moduleName)) {
                    loadModuleFromInstalledModules(moduleName);
                }
            }

            function registerAllModulesFromPaths(modulePaths) {
                fileLoader.loadAllFilesFromPaths(modulePaths).forEach(registerModule);
            }

            function getRegisteredModules() {
                var containerModules = coreContainer.getModuleRegistry();

                return Object.keys(containerModules);
            }

            return {
                getModuleBuilder: coreContainer.getModuleBuilder,
                getRegisteredModules: getRegisteredModules,
                loadModule: loadModule,
                override: override,
                registerAllModulesFromPaths: registerAllModulesFromPaths,
                registerModule: registerModule,
                registerModules: registerModules
            };
        };
    }

    var dependencies = ['fileLoader', 'moduleLoader', 'moduleUtils', 'moduleWrapper'];

    container.register('registryFactory', registryFactoryBuilder, dependencies);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.fsLoader = loader;
    }
})(function (container) {
    'use strict';

    function fsFunctionFake() {
        throw new Error('Cannot load filesystem modules when not in NodeJS environmet');
    }

    function fsFactory() {
        var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

        var fsFake = {
            readdirSync: fsFunctionFake,
            lstatSync: fsFunctionFake
        };

        return isNode ? require('fs') : fsFake;
    }

    container.register('fs', fsFactory, []);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.globLoader = loader;
    }
})(function (container) {
    'use strict';

    function globFunctionFake() {
        throw new Error('Cannot load filesystem modules when not in NodeJS environmet');
    }

    function globFactory() {
        var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

        function globFake() {
            globFunctionFake();
        }

        globFake.sync = globFunctionFake;

        return isNode ? require('glob') : globFake;
    }

    container.register('glob', globFactory, []);
});
(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.pathLoader = loader;
    }
})(function (container) {
    'use strict';

    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    function pathFactory() {
        return isNode ? require('path') : null;
    }

    container.register('path', pathFactory, []);
});
(function () {
    'use strict';

    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
    var coreContainer = isNode ? require('./coreContainer') : window.djectCoreFactory();

    if (isNode) {
        module.exports = coreContainer.build('dject');
    } else {
        Object.keys(window.djectLoaders).forEach(function (loaderKey) {
            window.djectLoaders[loaderKey](coreContainer);
        });

        window.djectLoaders = undefined;
        window.dject = coreContainer.build('dject');
    }
})();