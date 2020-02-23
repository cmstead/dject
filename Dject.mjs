class Dject {

    constructor(dependencyMap) {
        Object
            .keys(dependencyMap)
            .forEach(key =>
                this[key] = dependencyMap[key]);
    }

    static buildDependencyMap(dependencyNames, injectedDependencies) {
        return dependencyNames.reduce(function (dependencyMap, name, index) {
            dependencyMap[name] = injectedDependencies[index];
            return dependencyMap;
        }, {});
    }

    static build(instantiableObject, dependencies) {
        const dependencyNames = instantiableObject['@dependencies'];
        const dependencyMap = this.buildDependencyMap(dependencyNames, dependencies);

        return new instantiableObject(dependencyMap);
    }
}

export default Dject;
