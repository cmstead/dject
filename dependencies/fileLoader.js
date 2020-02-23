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
                const fullPath = path.join(filePath, fileName);
                return require(fullPath);
            }
        }

        function isFileInPaths(modulePaths, moduleName) {
            const fileName = moduleName + '.js';

            const acceptedPaths = modulePaths
                .filter(function (filePath) {
                    return filePath.endsWith(fileName);
                });

            return acceptedPaths.length > 0;
        }

        function loadFileFromPaths(modulePaths, moduleName) {
            const fileName = moduleName + '.js';
            const fileTestPattern = new RegExp('[\\/\\\\]' + moduleName + '\\.js$', 'i');

            const acceptedPaths = modulePaths
                .filter(function (filePath) {
                    return fileTestPattern.test(filePath);
                });

            if (acceptedPaths.length > 1) {
                const message = 'Cannot load module, ' + moduleName + '; duplicate modules exist in the following paths: ' + acceptedPaths.join(',');
                throw new Error(message);
            }


            const filePath = acceptedPaths.length > 0
                ? getFileFolder(acceptedPaths[0])
                : null;

            return filePath !== null
                ? loadFileFromPath(filePath)(fileName)
                : null;
        }

        function getFileName(filePath) {
            const pathTokens = filePath.split(/[\/\\]/);

            return pathTokens.pop();
        }

        function getFileFolder(filePath) {
            const pathTokens = filePath.split(/[\/\\]/);
            const folderPathTokens = pathTokens.slice(0, pathTokens.length - 1);

            return folderPathTokens.join(path.sep);
        }

        function loadAllFilesFromPaths(modulePaths) {
            return modulePaths.map(function (filePath) {
                const fileName = getFileName(filePath);
                const folderName = getFileFolder(filePath);

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
