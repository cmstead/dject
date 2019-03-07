function filemetaUtils(
    utils
) {
    'use strict';

    function findFilemeta(contentNode) {
        return contentNode.sectionContent[0].find(value =>
            typeof value === 'object'
            && value !== null
            && typeof value.filemeta !== 'undefined');
    }

    function copyFilemeta(filemeta) {
        return {
            filemeta: Object
                .keys(filemeta.filemeta)
                .reduce((result, key) => {
                    result[key] = filemeta.filemeta[key];
                    return result;
                }, {})
        };
    }

    function buildMetaTree(content) {
        return content.map(contentNode => {
            let filemeta = utils.pipe(
                contentNode,
                (contentNode) => findFilemeta(contentNode),
                (filemeta) => copyFilemeta(filemeta)
            );

            filemeta.type = contentNode.sectionType;
            filemeta.children = [];

            return filemeta;
        });
    }


    return {
        buildMetaTree: buildMetaTree,
        copyFilemeta: copyFilemeta,
        findFilemeta: findFilemeta
    }
}

module.exports = filemetaUtils;