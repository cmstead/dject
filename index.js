'use strict';

var fs = require('fs');

var InjectorError = require('./modules/injectorError');
var setDefaults = require('./modules/setDefaults');
var wrapOnInstantiable = require('./modules/wrapOnInstantiable');

function djectFactory(config) {
    var registeredModules = {};
    var registeredSingletons = {};

    config.cwd = typeof config.cwd === 'string' ? config.cwd : '.';

    function register(module) {
        var cleanModule = setDefaults(module);

        registeredModules[cleanModule['@name']] = wrapOnInstantiable(cleanModule);
    }

    function registerSingleton(moduleDef, moduleInstance) {
        registeredSingletons[moduleDef['@name']] = moduleInstance;

        return moduleInstance;
    }

    function getRegisteredModules () {
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

        if(validPaths.length > 0) {
            var filePath = [config.cwd, validPaths[0], moduleName].join('/');
            register(require(filePath));
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

    return {
        build: build,
        getRegisteredModules: getRegisteredModules,
        register: register
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