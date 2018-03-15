(function (loader) {

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = loader;
    } else {
        window.djectLoaders.fileLoaderLoader = loader;
    }

})(function (container) {

    function fileLoaderFactory(fs) {
        const jsPattern = /^.+\.js$/;

        function loadFileFromPath(filePath) {
            return function (filename) {
                return require(filePath + '/' + filename);
            }
        }

        // function loadFileFromPaths(modulePaths) {

        // }

        function isJSFile(filename) {
            return filename.match(jsPattern) !== null;
        }

        function loadAllFilesFromPath(modulePath) {
            return fs.readdirSync(modulePath)
                .filter(isJSFile)
                .map(loadFileFromPath(modulePath));
        }

        function loadAllFilesFromPaths(cwd, modulePaths) {
            return modulePaths.reduce(function (moduleOutput, path) {
                return moduleOutput.concat(loadAllFilesFromPath(cwd + '/' + path));
            }, []);
        }

        return {
            loadAllFilesFromPaths: loadAllFilesFromPaths
        };
    }

    container.register('fileLoader', fileLoaderFactory, ['fs']);

});