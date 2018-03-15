(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.fileLoaderLoader = loader;
    }

})(function (container) {

    function fileLoaderFactory(fs, path) {

        const jsPattern = /^.+\.js$/;

        function statFile(filepath) {
            try {
                return fs.lstatSync(filepath).isFile();
            } catch (e) {
                return false;
            }
        }

        function loadFileFromPath(filePath) {
            return function (filename) {
                var fullPath = path.join(filePath, filename);
                return require(fullPath);
            }
        }

        function loadFileFromPaths(cwd, modulePaths, moduleName) {
            var fileName = moduleName + '.js';

            var acceptedPaths = modulePaths
                .map(function (modulePath) {
                    return path.join(cwd, modulePath);
                })
                .filter(function (modulePath) {
                    var filepath = path.join(modulePath, fileName);
                    return statFile(filepath);
                });

            if (acceptedPaths.length > 1) {
                var message = 'Cannot load module, ' + moduleName + '; duplicate modules exist in the following paths: ' + acceptedPaths.join(',');
                throw new Error(message);
            }

            var filePath = acceptedPaths[0];
            return loadFileFromPath(filePath)(fileName)
        }

        function isJSFile(filename) {
            return filename.match(jsPattern) !== null;
        }

        function loadAllFilesFromPath(modulePath) {
            return fs.readdirSync(modulePath)
                .filter(isJSFile)
                .map(loadFileFromPath(modulePath));
        }

        function loadAllFilesFromPaths(cwd, modulePaths) {
            return modulePaths.reduce(function (moduleOutput, filePath) {
                var modulePath = path.join(cwd, filePath);
                return moduleOutput.concat(loadAllFilesFromPath(modulePath));
            }, []);
        }

        return {
            loadFileFromPaths: loadFileFromPaths,
            loadAllFilesFromPaths: loadAllFilesFromPaths
        };
    }

    container.register('fileLoader', fileLoaderFactory, ['fs', 'path']);

});