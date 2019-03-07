function documentUtils() {
    'use strict';

    const titleFormatters = {
        document: '#',
        chapter: '##',
        "section-main": '##',
        section: '###',
        "subsection-minor": '#####',
        subsection: '####',
        subtitle: '####'
    }

    function buildTitleString(type, value) {
        const titleFormatter = titleFormatters[type];

        return `${titleFormatter} ${value} ${titleFormatter}`;
    }

    function isMainContentType(contentType) {
        return contentType === 'chapter'
            || contentType === 'section-main';
    }

    function buildTitle(contentType, filemeta) {
        let titleValues = [];

        if (typeof filemeta.filemeta.title === 'string') {
            const titleString = buildTitleString(contentType, filemeta.filemeta.title);
            titleValues.push(titleString);
        }

        if (typeof filemeta.filemeta.subtitle === 'string') {
            const subtitleString = buildTitleString('subtitle', filemeta.filemeta.subtitle);;
            titleValues.push(subtitleString);
        }

        return titleValues.join('\n');
    }

    return {
        buildTitle: buildTitle
    }
}

module.exports = documentUtils;