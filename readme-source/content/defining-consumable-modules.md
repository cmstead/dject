<!--bl
(filemeta
    (title "Module Patterns for Dject"))
/bl-->

DJect expects that all modules will be defined either with a factory function or as an instantiable object. Let's look at
how to define each and what kinds of metadata can be attached.

### Factory Functions ###

```javascript
'use strict';

function testComposed(testBase, otherBase) {
    return {
        testBase: testBase,
        testOtherBase: otherBase
    };
}

testComposed['@name'] = 'testComposed'; // optional
testComposed['@dependencies'] = ['testBase', 'otherBase']; // optional
testComposed['@singleton'] = true; // optional if false

module.exports = testComposed;
```

This module uses a factory function to close over its dependencies. Although this module is simple and only returns
an object containing its dependencies, modules can contain any logic normally contained in a Node module.  Please note
the attached metadata at the bottom declaring a name, a list of dependencies and whether it is a singleton. We will go
over these tags in greater detail later.

### Instantiable Modules ###

```javascript
'use strict';

function TestInstantiable (testBase, otherBase) {
    this.objs = {
        testBase: testBase,
        otherBase: otherBase
    };
}

TestInstantiable.prototype = {
    toString: function () {
        return 'TestInstantiableInstance: \n' + JSON.stringify(this.objs, null, 4);
    }
};

TestInstantiable['@instantiable'] = true; // required if true
TestInstantiable['@dependencies'] = ['testBase', 'otherBase']; // optional

module.exports = TestInstantiable;
```

This module is instantiable, and it is annotated at the bottom to tell DJect as much. The instantiable tag is unique to
instantiable objects and will be covered in the next section.

### Using Dject in client-side ES Next modules ###

Dject can be used in client-side applications, even using import statements.  The recommended module format is as follows.

```javascript
const dependencies = [
    '__container',
    'httpRequestThing',
    'businessLogic'
];

function myModule(...injectedDependencies) {
    const [container] = injectedDependencies;

    const {
        httpRequestThing,
        businessLogic
    } = container.buildDependencyMap(dependencies, injectedDependencies);
    
    function myBehavior(recordId) {
        return httpRequestThing.get(`/a/url/${recordId}`)
            .then((data) => buseinssLogic.processData(data));
    }

    return {
        myBehavior
    };
}

myModule['@dependencies'] = dependencies;

export default {
    name: 'myModule',
    value: myModule
};
```

### Getting A Module Manually ###

```javascript
const testModule = container.build('testComposed');
```

