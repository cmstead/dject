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
                const fullPath = path.join(filePath, filename);
                return require(fullPath);
            }
        }

        function isFileInPaths(modulePaths, moduleName) {
            const fileName = moduleName + '.js';

            const acceptedPaths = modulePaths
                .filter(function (modulePath) {
                    const filepath = path.join(modulePath, fileName);
                    return statFile(filepath);
                });

            return acceptedPaths.length > 0;
        }

        function loadFileFromPaths(modulePaths, moduleName) {
            const fileName = moduleName + '.js';

            const acceptedPaths = modulePaths
                .filter(function (modulePath) {
                    const filepath = path.join(modulePath, fileName);
                    return statFile(filepath);
                });

            if (acceptedPaths.length > 1) {
                const message = 'Cannot load module, ' + moduleName + '; duplicate modules exist in the following paths: ' + acceptedPaths.join(',');
                throw new Error(message);
            }

            const filePath = acceptedPaths[0];
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
