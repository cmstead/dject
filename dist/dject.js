(function() {
		'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	(function (buildConfig) {
	    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
	    if (isNode) {
	        module.exports = buildConfig();
	    } else {
	        window.buildDjectConfig = buildConfig();
	    }
	})(function () {
	    'use strict';
	
	    return function buildConfig(config) {
	        config = config !== null && (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' ? config : {};
	
	        config.cwd = typeof config.cwd === 'string' ? config.cwd : '.';
	        config.modulePaths = Object.prototype.toString.call(config.modulePaths) === '[object Array]' ? config.modulePaths : ['modules'];
	        config.allowOverride = typeof config.allowOverride === 'boolean' ? config.allowOverride : false;
	        config.eagerLoad = typeof config.eagerLoad === 'boolean' ? config.eagerLoad : false;
	
	        return config;
	    };
	});
	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	(function (functionHelperFactory) {
	    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
	
	    if (isNode) {
	        module.exports = functionHelperFactory();
	    } else {
	        window.djectFunctionHelper = functionHelperFactory();
	    }
	})(function () {
	    'use strict';
	
	    function getFunctionName(fn) {
	        return fn.name === '' ? 'anonymous' : fn.name;
	    }
	
	    function getArgStr(fn) {
	        try {
	            return fn.toString().match(/function\s.*?\(([^)]*)\)/)[1];
	        } catch (e) {
	            var message = typeof fn === 'function' ? 'Unable to parse arguments from function or expression: ' + getFunctionName(fn) : 'Cannot register module. Expected function, but got ' + (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) + ' with value ' + JSON.stringify(fn, null, 4);
	
	            throw new Error(message);
	        }
	    }
	
	    function getParamNames(fn) {
	        return getArgStr(fn).replace(/\/\*.*\*\//, '').split(',').map(function (paramName) {
	            return paramName.trim();
	        }).filter(function (paramName) {
	            return paramName.length > 0;
	        });
	    }
	
	    return {
	        getParamNames: getParamNames
	    };
	});
	'use strict';
	
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
	            get: function get() {
	                this.name + ': ' + this.messageBody;
	            }
	        });
	
	        Object.defineProperty(this, 'stack', {
	            get: function get() {
	                return localError.stack;
	            }
	        });
	
	        return this;
	    }
	
	    InjectorError.prototype = {
	        toString: function toString() {
	            return this.name + ': ' + this.messageBody;
	        }
	    };
	
	    return InjectorError;
	});
	'use strict';
	
	/* global djectFunctionHelper */
	
	(function (setDefaultsFactory) {
	    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
	
	    if (isNode) {
	        var functionHelper = require('./functionHelper');
	
	        module.exports = setDefaultsFactory(functionHelper);
	    } else {
	        window.setDjectDefaults = setDefaultsFactory(djectFunctionHelper);
	    }
	})(function (functionHelper) {
	    'use strict';
	
	    function checkPropOn(module) {
	        return function (propName) {
	            return typeof module[propName] !== 'undefined';
	        };
	    }
	
	    function getPropOrDefaultOn(module) {
	        var hasProp = checkPropOn(module);
	
	        return function (propName, defaultProp) {
	            return hasProp(propName) ? module[propName] : defaultProp;
	        };
	    }
	
	    function setDefaults(module) {
	        var getPropOrDefault = getPropOrDefaultOn(module);
	
	        module['@name'] = getPropOrDefault('@name', module.name);
	        module['@instantiable'] = getPropOrDefault('@instantiable', false);
	        module['@singleton'] = getPropOrDefault('@singleton', false);
	        module['@dependencies'] = getPropOrDefault('@dependencies', functionHelper.getParamNames(module));
	
	        return module;
	    }
	
	    return setDefaults;
	});
	'use strict';
	
	(function (wrapOnInstantiableFactory) {
	    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
	
	    if (isNode) {
	        module.exports = wrapOnInstantiableFactory();
	    } else {
	        window.djectWrapOnInstantiable = wrapOnInstantiableFactory();
	    }
	})(function () {
	    'use strict';
	
	    function isMetadataKey(key) {
	        return key.match(/^\@.*$/) !== null;
	    }
	
	    function applyMetadata(InstantiableObj, InstantiableFactory) {
	        Object.keys(InstantiableObj).filter(isMetadataKey).forEach(function (key) {
	            InstantiableFactory[key] = InstantiableObj[key];
	        });
	
	        return InstantiableFactory;
	    }
	
	    function wrapInstantiable(InstantiableObj) {
	        function InstantiableFactory() {
	            var dependencies = Array.prototype.slice.call(arguments, 0);
	            var newObj = Object.create(InstantiableObj.prototype);
	
	            InstantiableObj.apply(newObj, dependencies);
	
	            return newObj;
	        }
	
	        return applyMetadata(InstantiableObj, InstantiableFactory);
	    }
	
	    function wrapOnInstantiable(module) {
	        return module['@instantiable'] ? wrapInstantiable(module) : module;
	    }
	
	    return wrapOnInstantiable;
	});
	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/* global
	    djectInjectorError,
	    setDjectDefaults,
	    djectWrapOnInstantiable,
	    buildDjectConfig */
	
	(function (djectBuilder) {
	
	    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
	
	    var fsFake = {
	        lstatSync: function lstatSync() {
	            throw new Error('Module not loaded, cannot stat files in the browser.');
	        }
	    };
	
	    function loadRemoteModulesFake() {
	        throw new Error('Module not loaded, cannot load filesystem modules in the browser.');
	    }
	
	    if (isNode) {
	        var fs = require('fs');
	        var InjectorError = require('./bin/injectorError');
	        var setDefaults = require('./bin/setDefaults');
	        var wrapOnInstantiable = require('./bin/wrapOnInstantiable');
	        var buildConfig = require('./bin/buildConfig');
	        var loadRemoteModules = require('./bin/loadRemoteModules');
	
	        module.exports = djectBuilder(fs, InjectorError, setDefaults, wrapOnInstantiable, buildConfig, loadRemoteModules);
	    } else {
	        window.djectFunctionHelper = djectBuilder(fsFake, djectInjectorError, setDjectDefaults, djectWrapOnInstantiable, buildDjectConfig, loadRemoteModulesFake);
	    }
	})(function (fs, InjectorError, setDefaults, wrapOnInstantiable, buildConfig, loadRemoteModules) {
	
	    'use strict';
	
	    function djectFactory(config) {
	        var registeredModules = {};
	        var registeredSingletons = {};
	
	        config = buildConfig(config);
	
	        function getModuleName(module) {
	            return typeof module['@name'] !== 'undefined' ? module['@name'] : module.name;
	        }
	
	        function registerModules(moduleArray) {
	            moduleArray.forEach(register);
	        }
	
	        function register(module) {
	            var moduleName = getModuleName(module);
	
	            if (typeof registeredModules[moduleName] !== 'undefined') {
	                throw new InjectorError('Cannot reregister module "' + moduleName + '"');
	            }
	
	            registerModule(module);
	        }
	
	        function registerModule(module) {
	            var cleanModule = setDefaults(module);
	
	            registeredModules[cleanModule['@name']] = wrapOnInstantiable(cleanModule);
	        }
	
	        function registerSingleton(moduleDef, moduleInstance) {
	            registeredSingletons[moduleDef['@name']] = moduleInstance;
	
	            return moduleInstance;
	        }
	
	        function overrideModule(module) {
	            if (!config.allowOverride) {
	                throw new InjectorError('Set "allowOverride: true" in your config to allow module registration override');
	            }
	
	            var moduleName = getModuleName(module);
	
	            if (typeof registeredModules[moduleName] === 'undefined') {
	                throw new InjectorError('Cannot override unregistered module "' + moduleName + '"');
	            }
	
	            registerModule(module);
	        }
	
	        function overrideModules(moduleArray) {
	            moduleArray.forEach(overrideModule);
	        }
	
	        function getRegisteredModules() {
	            return Object.keys(registeredModules);
	        }
	
	        function build(moduleName) {
	            var moduleDef = getModuleOrThrow(moduleName);
	
	            return moduleDef['@singleton'] ? getSingleton(moduleDef) : buildNew(moduleDef);
	        }
	
	        function buildNew(moduleDef) {
	            try {
	                var dependencies = moduleDef['@dependencies'].map(build);
	            } catch (e) {
	                var message = 'Dependency chain is either circular or too deep to process:';
	                var errorMessage = typeof e.message === 'string' ? e.message : '';
	                var callstackError = errorMessage.match(/call stack/) !== null;
	                var injectorError = errorMessage.match(/Injector Error\:/) !== null;
	
	                if (!callstackError || injectorError) {
	                    throw e;
	                } else {
	                    throw new InjectorError(message + ' ' + e.message);
	                }
	            }
	
	            return moduleDef.apply(null, dependencies);
	        }
	
	        function getSingleton(moduleDef) {
	            var registeredSingleton = registeredSingletons[moduleDef['@name']];
	            var singletonExists = typeof registeredSingleton !== 'undefined';
	
	            return singletonExists ? registeredSingleton : registerSingleton(moduleDef, buildNew(moduleDef));
	        }
	
	        function getModuleOrThrow(moduleName) {
	            var moduleDef = registeredModules[moduleName];
	
	            if (typeof moduleDef === 'undefined') {
	                moduleDef = loadFileSystemModule(moduleName);
	            }
	
	            return throwOnNoModule(moduleDef, moduleName);
	        }
	
	        function loadFileSystemModule(moduleName) {
	            var fileName = [moduleName, 'js'].join('.');
	            var validPaths = config.modulePaths.filter(statModule(fileName, config.cwd));
	
	            if (validPaths.length === 1) {
	                var filePath = [config.cwd, validPaths[0], moduleName].join('/');
	                var module;
	                var loadCount = 0;
	
	                // Sometimes the module is loaded as undefined.
	                while (typeof module === 'undefined' && ++loadCount <= 10) {
	                    module = require(filePath);
	                }
	
	                register(module);
	            } else if (validPaths.length > 1) {
	                throw new InjectorError('Found duplicate module "' + moduleName + '" in paths ' + validPaths.join(', '));
	            }
	
	            return registeredModules[moduleName];
	        }
	
	        function statModule(moduleName, cwd) {
	            return function (path) {
	                var filePath = [cwd, path, moduleName].join('/');
	                var result = false;
	
	                try {
	                    fs.lstatSync(filePath);
	                    result = true;
	                } catch (e) {/* noop */}
	
	                return result;
	            };
	        }
	
	        function throwOnNoModule(moduleDef, moduleName) {
	            if (typeof moduleDef === 'undefined') {
	                throw new InjectorError('Module "' + moduleName + '" does not exist');
	            }
	
	            return moduleDef;
	        }
	
	        function loadSubtree(dependencies, submoduleName) {
	            return dependencies.concat([getDependencyTree(submoduleName)]);
	        }
	
	        function getDependencyTree(moduleName) {
	            var module = getModuleOrThrow(moduleName);
	
	            return {
	                name: moduleName,
	                instantiable: module['@instantiable'],
	                singleton: module['@singleton'],
	                dependencies: module['@dependencies'].reduce(loadSubtree, [])
	            };
	        }
	
	        function loadModule(moduleName) {
	            if (typeof registeredModules[moduleName] === 'undefined') {
	                var module = getModuleOrThrow(moduleName);
	                registeredModules[moduleName] = module;
	            }
	        }
	
	        function registerModuleWithName(moduleName, value) {
	            var cleanModule = wrapOnInstantiable(value);
	            cleanModule = setDefaults(cleanModule);
	            cleanModule['@name'] = moduleName;
	
	            registeredModules[moduleName] = cleanModule;
	        }
	
	        function buildSubcontainerConfig() {
	            var newConfig = Object.create(config);
	            newConfig.allowOverride = true;
	
	            return newConfig;
	        }
	
	        function newSubcontainer() {
	            var subcontainer = buildNewContainer(buildSubcontainerConfig());
	
	            if (!config.eagerLoad) {
	                Object.keys(registeredModules).forEach(function (moduleName) {
	                    var moduleValue = registeredModules[moduleName];
	                    subcontainer.registerModuleWithName(moduleName, moduleValue);
	                });
	            }
	
	            return subcontainer;
	        }
	
	        return {
	            build: build,
	            getDependencyTree: getDependencyTree,
	            getRegisteredModules: getRegisteredModules,
	            loadModule: loadModule,
	            registerModuleWithName: registerModuleWithName,
	            new: newSubcontainer,
	            override: overrideModule,
	            overrideModules: overrideModules,
	            register: register,
	            registerModules: registerModules
	        };
	    }
	
	    function buildNewContainer(config) {
	        if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) !== 'object') {
	            throw new Error('DJect requires a configuration object.');
	        }
	
	        var container = djectFactory(config);
	
	        if (config.eagerLoad === true) {
	            config.modulePaths.forEach(loadRemoteModules(config.cwd, container));
	        }
	
	        return container;
	    }
	
	    return {
	        new: buildNewContainer
	    };
	});
})();