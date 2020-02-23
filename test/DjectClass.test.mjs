import Dject from '../Dject.mjs';

const dependencies = [
    'test'
];

class TestClass extends Dject {
    constructor(dependencyMap) {
        super(dependencyMap);
    }

    static build(dependencies) {
        return Dject.build(TestClass, dependencies);
    }
}

TestClass['@dependencies'] = dependencies;

const testInstance = TestClass.build(['foo']);

if(testInstance.test !== 'foo') {
    throw new Error('Stupid.');
}
