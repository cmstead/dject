<!--bl
(filemeta
    (title "Consuming the Dject API and Examples"))
/bl-->

### dject.register ###

Register a dependency directly into the container (instead of loading it from the filesystem). An optional, second argument, name may be provided. Throws error if module is already registered.

```javascript
const container = require('./configuredDjectContainer.js');

function myModule() {
    function doStuff () {
        console.log('Doing stuff');
    }

    return {
        doStuff: doStuff
    };
}

// Primary means for registering a module:
container.register(myModule);

// Using the optional name argument:
container.register(function(){ return {}; }, 'otherModule');
```

### dject.registerModules ###

Register an array of modules at once. Throws error if module is already registered.

```javascript
const container = require('./configuredDjectContainer.js');

function myModuleFactory1() {
    function doStuff () {
        console.log('Doing stuff');
    }

    return {
        doStuff: doStuff
    };
}

function myModuleFactory2() {
    function doStuff () {
        console.log('Doing stuff');
    }

    return {
        doStuff: doStuff
    };
}

container.registerModules([myModuleFactory1, myModuleFactory2]);
```

### dject.build ###

Build a module, which will resolve and inject all dependencies throughout the system.

```javascript
const container = require('./configuredDjectContainer');
const myModule = container.build('myModule');
```

Dject will recognize modules installed to the node_modules directory by default. Simply camelCase the name and Dject will do the work. For instance, using the request-promise module:

```javascript
const requestPromise = container.build('requestPromise');
```

This will also work in dependency declarations such as:

```javascript
function myModule (requestPromise) {
    // do some async stuff with requestPromise

    return {
        // your API
    }
}

module.exports = myModule;
```

### dject.getDependencyTree ###

Identify and display all dependencies for a particular module. Any dependencies which have not yet been registered with the system will be identified and loaded.

```javascript
const container = require('./configuredDjectContainer');
container.getDependencyTree('TestInstantiable');
```

Output would look like this:

```json
{
    "name": "TestInstantiable",
    "instantiable": true,
    "singleton": false,
    "dependencies": [
        {
            "name": "testBase",
            "instantiable": false,
            "singleton": false
        },
        {
            "name": "otherBase",
            "instantiable": false,
            "singleton": false
        }
    ]
}
```

### dject.getRegisteredModules ###

This will return a list of all the currently registered modules. When a container is first built and nothing has been loaded into memory, the list will be empty. As modules are loaded, the list will grow.

```javascript
const container = require('./configuredDjectContainer');
container.getRegisteredModules();

// Output on a fresh container:

// []

// If we did the following:

container.getDependencyTree('TestInstantiable');
container.getRegisteredModules();

// The output would look like this:

// ['TestInstantiable', 'testBase', 'otherBase']
```

### dject.loadModule ###

This will load a module into your dject container.  No module will be constructed and dependencies will not be loaded.

```javascript
const container = require('./configuredDjectContainer');
container.loadModule('TestInstantiable');

// If this is your first load statement, we can see it listed like so:

container.getRegisteredModules();

// ['TestInstantiable']
```

### dject.new ###

This creates a new subcontainer which inherits all loaded modules from the parent container.  Since a subcontainer is a separate container with its own scope, any modules loaded into the subcontainer will not be loaded into the parent container.

```javascript
const container = require('./configuredDjectContainer');
const subcontainer = container.new();

subcontainer.load('TestInstantiable');
subcontainer.getRegisteredModules();

// ['TestInstantiable']

container.getRegisteredModules();

// []
```

### dject.override ###

Overrides module which has already been registered. Override is disallowed by default on a base container and will throw an error. Override is allowed by default on all subcontainers. Override will throw an error if a module is not already registered.

```javascript
const container = require('./configuredDjectContainer');

try{
    container.override(function(){}, 'TestInstantiable');
} catch (e) {
    // Error is caught -- cannot override unregistered module
}

container.load('TestInstantiable');

try{
    container.override(function() {}, 'TestInstantiable')
} catch (e) {
    // Error is caught -- override not allowed on base container unless configured
}

const subcontainer = container.new();

subcontainer.override(function () {}, 'TestInstantiable');
// No error is thrown -- override is allowed here
```

### dject.overrideModules ###

Allows for overriding multiple modules at once. Works similarly to registerModules. Throws errors on same cases as override.

```javascript
const container = require('./configuredDjectContainer');
container.getDependencyTree('TestInstantiable');

const subcontainer = container.new();
subcontainer.overrideModules(['TestInstantiable', 'testBase']);
```
