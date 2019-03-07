function extensionDefinitions(
    contentUtils,
    documentEnvironmentFactory,
    documentParser,
    filemetaUtils,
    fs
) {
    'use strict';

    function sectionContent(typeTag) {
        return function (value) {
            const parsedContent = this._get('import-file')(value);

            return this._get('dict')(
                this._get('tag')('sectionType', typeTag),
                this._get('tag')('sectionContent', parsedContent),
            );
        }
    }

    const extensionDefinitions = {
        filemeta: function (...args) {
            const metadata = this._get('dict').apply(this, args);
            return this._get('dict')(['filemeta', metadata]);
        },

        title: function (value) {
            return this._get('tag')('title', value);
        },

        subtitle: function (value) {
            return this._get('tag')('subtitle', value);
        },

        authors: function (value) {
            return this._get('tag')('authors', value);
        },

        'build-message': function (message) {
            console.log(`
******** Build Message     ********

${message}

******** End Build Message ********
`);
        },

        'table-of-contents': function (...chapterValues) {
            const chapters = Array.isArray(chapterValues[0]) ? chapterValues[0] : chapterValues;

            const metaTree = filemetaUtils.buildMetaTree(chapters);
            const tableOfContentsResult = contentUtils.buildTableOfContents(metaTree);
            const documentContent = contentUtils.buildDocumentContent(chapters);

            return `
## Table Of Contents ##
${tableOfContentsResult}
${documentContent.join('\n')}
`;
        },

        chapter: sectionContent('chapter'),
        section: sectionContent('section'),
        "section-main": sectionContent('section-main'),
        subsection: sectionContent('subsection'),
        "subsection-minor": sectionContent('subsection-minor'),

        'import-file': function (value) {
            const fileContent = fs.readFileSync(value, { encoding: 'utf8' });
            const environment = documentEnvironmentFactory
                .buildBaseEnvironment()
                ._merge(extensionDefinitions);

            return documentParser.parse(fileContent).evaluate(environment);
        }
    };

    return extensionDefinitions
}

module.exports = extensionDefinitions;