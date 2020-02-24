import IDjectExport from './IDjectExport';

class Dject {

    static attachDependencies(dependencyMap = {}){
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
        const classDependencies = instantiableObject['@dependencies'];
        const dependenciesAreDefined = Array.isArray(classDependencies);
        const dependencyNames = dependenciesAreDefined ? classDependencies : [];
        const dependencyMap = this.buildDependencyMap(dependencyNames, dependencies);

        return new instantiableObject(dependencyMap);
    }

    static prepareExport(instantiableObject): IDjectExport {
        return {
            name: instantiableObject.name,
            value: instantiableObject,
            type: instantiableObject
        };
    }
}

export default Dject;
