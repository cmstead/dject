function circular1 (circular2) {
    return {};
}

circular1['@dependencies'] = ['circular2'];

function circular2 (circular1) {
    return {};
}

circular2['@dependencies'] = ['circular1'];

module.exports = {
    circular1: circular1,
    circular2: circular2
};