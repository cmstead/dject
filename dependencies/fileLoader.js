(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.fileLoaderLoader = loader;
    }

})(function (container) {

    function fileLoaderFactory(fs, path) {

        var jsPattern = /^.+\.js$/;

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

        function isFileInPaths(modulePaths, moduleName) {
            var fileName = moduleName + '.js';

            var acceptedPaths = modulePaths
                .filter(function (modulePath) {
                    var filepath = path.join(modulePath, fileName);
                    return statFile(filepath);
                });

            return acceptedPaths.length > 0;
        }

        function loadFileFromPaths(modulePaths, moduleName) {
            var fileName = moduleName + '.js';

            var acceptedPaths = modulePaths
                .filter(function (modulePath) {
                    var filepath = path.join(modulePath, fileName);
                    return statFile(filepath);
                });

            if (acceptedPaths.length > 1) {
                var message = 'Cannot load module, ' + moduleName + '; duplicate modules exist in the following paths: ' + acceptedPaths.join(',');
                throw new Error(message);
            }

            var filePath = acceptedPaths[0];
            return typeof filePath !== 'undefined'
                ? loadFileFromPath(filePath)(fileName)
                : null;
        }

        function isJSFile(filename) {
            return filename.match(jsPattern) !== null;
        }

        function loadAllFilesFromPath(modulePath) {
            return fs.readdirSync(modulePath)
                .filter(isJSFile)
                .map(loadFileFromPath(modulePath));
        }

        function loadAllFilesFromPaths(modulePaths) {
            return modulePaths.reduce(function (moduleOutput, modulePath) {
                return moduleOutput.concat(loadAllFilesFromPath(modulePath));
            }, []);
        }

        return {
            isFileInPaths: isFileInPaths,
            loadFileFromPaths: loadFileFromPaths,
            loadAllFilesFromPaths: loadAllFilesFromPaths
        };
    }

    container.register('fileLoader', fileLoaderFactory, ['fs', 'path']);

});
