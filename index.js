'use strict';

var fs = require('fs');

var InjectorError = require('./modules/injectorError');
var setDefaults = require('./modules/setDefaults');
var wrapOnInstantiable = require('./modules/wrapOnInstantiable');
var buildConfig = require('./modules/buildConfig');

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
            throw new InjectorError('Dependency chain is either circular or too deep to process.');
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
            } catch (e) { /* noop */ }

            return result;
        }
    }

    function throwOnNoModule(moduleDef, moduleName) {
        if (typeof moduleDef === 'undefined') {
            throw new InjectorError('Module "' + moduleName + '" does not exist');
        }

        return moduleDef;
    }

    function setProp(obj, key, value) {
        obj[key] = value;
        return obj;
    }

    function loadSubtree(dependencies, submoduleName) {
        return dependencies.concat([getDependencyTree(submoduleName)]);
    }

    function getDependencyTree(moduleName) {
        var module = getModuleOrThrow(moduleName);
        var hasDependencies = module['@dependencies'].length > 0;

        return {
            name: moduleName,
            instantiable: module['@instantiable'],
            singleton: module['@singleton'],
            dependencies: module['@dependencies'].reduce(loadSubtree, [])
        };
    }

    return {
        build: build,
        getDependencyTree: getDependencyTree,
        getRegisteredModules: getRegisteredModules,
        override: overrideModule,
        overrideModules: overrideModules,
        register: register,
        registerModules: registerModules
    };

}

function buildNew(config) {
    if (typeof config !== 'object') {
        throw new Error('DJect requires a configuration object.');
    }

    return djectFactory(config);
}

module.exports = {
    new: buildNew
};