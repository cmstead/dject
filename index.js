/* global
    djectInjectorError,
    setDjectDefaults,
    djectWrapOnInstantiable,
    buildDjectConfig */

(function (djectBuilder) {

    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    var fsFake = {
        lstatSync: function () {
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

        module.exports = djectBuilder(
            fs,
            InjectorError,
            setDefaults,
            wrapOnInstantiable,
            buildConfig,
            loadRemoteModules);

    } else {
        window.djectFunctionHelper = djectBuilder(
            fsFake,
            djectInjectorError,
            setDjectDefaults,
            djectWrapOnInstantiable,
            buildDjectConfig,
            loadRemoteModulesFake);
    }

})(function (
    fs,
    InjectorError,
    setDefaults,
    wrapOnInstantiable,
    buildConfig,
    loadRemoteModules) {

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

        function throwOnModuleDoesNotExist(moduleName) {
            var moduleDoesNotExist = config.errorOnModuleDNE && getValidPaths(moduleName).length === 0;

            if (moduleDoesNotExist) {
                var errorMessage = 'Cannot register module ' + moduleName + ', because it does not exist in the filesystem and errorOnModuleDNE is true.';
                throw new Error(errorMessage);
            }
        }

        function throwOnReregister(InjectorError, moduleName) {
            if (typeof registeredModules[moduleName] !== 'undefined') {
                var errorMessage = 'Cannot reregister module "' + moduleName + '"';
                throw new InjectorError(errorMessage);
            }
        }

        function getModuleNameOrOption(optionalName, module) {
            return typeof optionalName === 'string'
                ? optionalName
                : getModuleName(module);
        }

        function register(module, optionalName) {
            var moduleName = getModuleNameOrOption(optionalName, module);

            throwOnModuleDoesNotExist(moduleName);
            throwOnReregister(InjectorError, moduleName);

            module['@name'] = moduleName;

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

        function throwOnUnregistered(moduleName) {
            if (typeof registeredModules[moduleName] === 'undefined') {
                throw new InjectorError('Cannot override unregistered module "' + moduleName + '"');
            }
        }

        function overrideModule(module, optionalName) {
            if (!config.allowOverride) {
                throw new InjectorError('Set "allowOverride: true" in your config to allow module registration override');
            }

            var moduleName = getModuleNameOrOption(optionalName, module);

            throwOnUnregistered(moduleName);

            module['@name'] = moduleName;

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

        function throwOnInjectorOrCallStackError(error) {
            var message = 'Dependency chain is either circular or too deep to process:';
            var errorMessage = typeof error.message === 'string' ? error.message : '';
            var callstackError = errorMessage.match(/call stack/) !== null;
            var injectorError = errorMessage.match(/Injector Error\:/) !== null;

            if (!callstackError || injectorError) {
                throw error;
            } else {
                throw new InjectorError(message + ' ' + error.message);
            }
        }

        function buildDependenciesOrThrow(moduleDef) {
            try {
                return moduleDef['@dependencies'].map(build);
            } catch (error) {
                throwOnInjectorOrCallStackError(error)
            }
        }

        function buildNew(moduleDef) {
            var dependencies = buildDependenciesOrThrow(moduleDef)
            return moduleDef.apply(null, dependencies);
        }

        function getSingleton(moduleDef) {
            var registeredSingleton = registeredSingletons[moduleDef['@name']];
            var singletonExists = typeof registeredSingleton !== 'undefined';

            return singletonExists ? registeredSingleton : registerSingleton(moduleDef, buildNew(moduleDef));
        }

        function throwOnNoModule(moduleDef, moduleName) {
            if (typeof moduleDef === 'undefined') {
                throw new InjectorError('Module "' + moduleName + '" does not exist');
            }

            return moduleDef;
        }

        function getModuleOrThrow(moduleName) {
            var moduleDef = registeredModules[moduleName];

            if (typeof moduleDef === 'undefined') {
                moduleDef = loadFileSystemModule(moduleName);
            }

            return throwOnNoModule(moduleDef, moduleName);
        }

        function statModule(moduleName, cwd) {
            return function (path) {
                var filePath = [cwd, path, moduleName].join('/');
                var result = false;

                try {
                    fs.lstatSync(filePath);
                    result = true;
                } catch (e) { /* noop */ }

                return result;
            }
        }

        function getValidPaths(moduleName) {
            var fileName = [moduleName, 'js'].join('.');
            return config.modulePaths.filter(statModule(fileName, config.cwd));
        }

        function tryLoadModule(filePath) {
            var module;
            var loadCount = 0;

            // Sometimes the module is loaded as undefined.
            while (typeof module === 'undefined' && ++loadCount <= 10) {
                module = require(filePath);
            }

            return module;
        }

        function registerFilesystemModule(validPaths, moduleName) {
            var filePath = [config.cwd, validPaths[0], moduleName].join('/');
            var module = tryLoadModule(filePath);

            register(module);
        }

        function registerFilesystemModuleOrThrow(validPaths, moduleName) {
            if (validPaths.length === 1) {
                registerFilesystemModule(validPaths, moduleName)
            } else if (validPaths.length > 1) {
                throw new InjectorError('Found duplicate module "' + moduleName + '" in paths ' + validPaths.join(', '));
            }

        }

        function loadFileSystemModule(moduleName) {
            var validPaths = getValidPaths(moduleName);

            registerFilesystemModuleOrThrow(validPaths, moduleName)
            return registeredModules[moduleName];
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

        function buildSubcontainerConfig() {
            var newConfig = Object.create(config);
            newConfig.allowOverride = true;

            return newConfig;
        }

        function newSubcontainer() {
            var subcontainer = buildNewContainer(buildSubcontainerConfig());

            if (!config.eagerLoad) {
                Object
                    .keys(registeredModules)
                    .forEach(function (moduleName) {
                        var moduleValue = registeredModules[moduleName];
                        subcontainer.register(moduleValue);
                    });
            }

            return subcontainer;
        }

        return {
            build: build,
            getDependencyTree: getDependencyTree,
            getRegisteredModules: getRegisteredModules,
            loadModule: loadModule,
            new: newSubcontainer,

            override: overrideModule,
            overrideModules: overrideModules,

            register: register,
            registerModules: registerModules
        };

    }

    function buildNewContainer(config) {
        if (typeof config !== 'object') {
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


