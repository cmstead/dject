function documentEnvironmentFactory(
    coreEnvironmentFactory,
    coreDefinitions
) {
    'use strict';

    function buildBaseEnvironment() {
        return coreEnvironmentFactory()
            ._merge(coreDefinitions);
    }

    return {
        buildBaseEnvironment: buildBaseEnvironment
    }

}

module.exports = documentEnvironmentFactory;