function contentUtils(
    documentUtils,
    filemetaUtils
) {
    'use strict';

    function buildLinkSlug(title) {
        return `user-content-${title.toLowerCase().replace(/\s/g, '-')}`;
    }

    const contentChunkLabels = {
        section: 'Section',
        chapter: 'Chapter'
    };

    function getChunkType(metaNodeType) {
        return metaNodeType === 'chapter' ? 'chapter' : 'section';
    }

    function buildTableOfContents(metaTree) {
        const currentChunkIndex = {
            section: 0,
            chapter: 0
        };

        return metaTree
            .reduce(function (result, metaNode) {
                const chunkType = getChunkType(metaNode.type);
                const chunkIndex = ++currentChunkIndex[chunkType];
                const chunkLabel = contentChunkLabels[chunkType];

                return `${result}\n- [${chunkLabel} ${chunkIndex}: ${metaNode.filemeta.title}](#${buildLinkSlug(metaNode.filemeta.title)})`
            }, '');
    }

    function constructFilemetaContent(contentType, filemeta) {
        return documentUtils.buildTitle(contentType, filemeta);
    }



    function isContentNode(contentValue) {
        const matchesNodePattern = typeof contentValue === 'object'
            && contentValue !== null
            && typeof contentValue.sectionType === 'string';

        return matchesNodePattern;
    }

    function contentRollup(contentValue) {

        if (typeof contentValue === 'string') {
            return contentValue;
        } else if (Array.isArray(contentValue)) {
            const contentNodes = contentValue.filter(isContentNode);

            return contentNodes.length > 0 ? contentNodes.map(buildFileContent).join('\n') : null;
        } else {
            return null;
        }
    }

    function isContentString(contentValue) {
        return typeof contentValue === 'string';
    }

    function buildFileContent(contentNode) {
        const filemeta = filemetaUtils.findFilemeta(contentNode);
        const stringValues = contentNode.sectionContent
            .map(contentRollup)
            .filter(isContentString);

        const markdownContent = stringValues.join('\n');

        const titleContent = constructFilemetaContent(contentNode.sectionType, filemeta);

        return `
${titleContent}
${markdownContent}
    `;
    }

    function buildDocumentContent(contentNodes) {
        return contentNodes.reduce(function (result, contentNode) {
            const fileContent = buildFileContent(contentNode);
            return result.concat([fileContent]);
        }, []);
    }

    return {
        buildDocumentContent: buildDocumentContent,
        buildFileContent: buildFileContent,
        constructFilemetaContent: constructFilemetaContent,
        buildTableOfContents: buildTableOfContents
    }
}

module.exports = contentUtils;