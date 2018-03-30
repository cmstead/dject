'use strict';

const fs = require('fs');
const container = require('dject-core')();

const dependencyPath = __dirname + '/dependencies';
const dependencyFiles = fs.readdirSync(dependencyPath);

const wrappedModulePath = __dirname + '/dependencies/wrappedModules';
const wrappedModuleFiles = fs
    .readdirSync(wrappedModulePath)
    .map(value => '/wrappedModules/' + value);

const dotPattern = /^\.+$/;
const jsPattern = /^.+\.js$/;

const isModuleFile =
    value =>
        value.match(dotPattern) === null &&
        value.match(jsPattern) !== null;

dependencyFiles
    .concat(wrappedModuleFiles)
    .filter(isModuleFile)
    .forEach(filePath => {
        const moduleLoader = require(dependencyPath + '/' + filePath);
        moduleLoader(container);
    });

module.exports = container;
