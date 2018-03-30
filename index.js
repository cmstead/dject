(function () {
    'use strict';

    var isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
    var coreContainer = isNode ? require('./coreContainer') : window.djectCoreFactory();

    if (isNode) {
        module.exports = coreContainer.build('dject');
    } else {
        Object
            .keys(window.djectLoaders)
            .forEach(function(loaderKey) {
                window.djectLoaders[loaderKey](coreContainer);
            });

        window.djectLoaders = undefined;
        window.dject = coreContainer.build('dject');
    }
})();
