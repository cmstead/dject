
# Dject #
#### Dependency injection for node made easy ####

## Table Of Contents ##

- [Section 1: Introduction](#user-content-introduction)
- [Section 2: Dject Features](#user-content-dject-features)
- [Section 3: Getting Started](#user-content-getting-started)
- [Section 4: Configuration Parameters](#user-content-configuration-parameters)
- [Section 5: Module Patterns for Dject](#user-content-module-patterns-for-dject)
- [Section 6: Consuming the Dject API and Examples](#user-content-consuming-the-dject-api-and-examples)
- [Section 7: Dject API and Metadata](#user-content-dject-api-and-metadata)
- [Section 8: Version History](#user-content-version-history)

## Introduction ##

Working with require statements violates one of the core tenants of Martin Fowler's rule for depending on abstractions over concretions. This is because every time you require a module, you are telling Node you want precisely one file which provides precisely one API.  To break these dependencies, you have to build factories... lots of them.

DJect is built to simplify workflow to declaring where your node modules live in your project and then simply requesting them as needed. Any modules not loaded directly through the container.register() endpoint are lazily loaded from the filesystem just in time to fulfill the dependency need. This means your application only loads the dependencies it needs and you don't have to spend your time worrying about managing your dependency chain by hand with massive factory trees.

    

## Dject Features ##

- Lazy loading of dependencies from the filesystem - only load what you need
- Eager loading of dependencies through module API
- Simple dependency chain management
- Fully sandboxed to safeguard against cross-project contamination
- Dependency management configured through attached metadata
- Easy configuration for multiple module locations
- Support for factory methods and instantiable objects

    

## Getting Started ##

The easiest way to get started with Dject is to use the [https://www.npmjs.com/package/dject-cli](Dject CLI). Then your setup and build can be fully automated!

DJect requires a single module to be created and cached by Node (for CommonJS modules). This means your setup is as simple as creating a single JS file, container.js, like the following:

```javascript
'use strict'

var config = {
    cwd: './spec',
    modulePaths: [
        'side-load-modules',
        'testModules',
        'globbedModules/**/*.js'
    ],
    allowOverride: false,
    eagerLoad: false,
    errorOnModuleDNE: false,
    dependenciesAsObject: false
};

module.exports = require('dject').new(config);
```

Every time you require container.js, Node will capture the cached export and provide it to your requiring module.  This
guarantees your container is a singleton and will always work from the modules loaded elsewhere from within your project.
However, because your container is built within your project, no two projects will ever share the same DJect container.

    

## Configuration Parameters ##

- cwd -- The directory DJect will prepend all paths with; default is '.'
- modulePaths -- An array of all paths where a module might be found; file globbing is allowed
- allowOverride -- Configure whether overriding a module is permitted from within the container scope; default is false
- eagerLoad -- Tells DJect to eagerly load all modules in provided directories; default is false
- errorOnModuleDNE -- Throws an error if user attempts to register a module which does not exist in the filesystem; default is false
- dependenciesAsObject -- Provides dependencies as properties on a single object; this will change the way all dependencies are provided throughout your application
    

## Module Patterns for Dject ##

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


    

## Consuming the Dject API and Examples ##

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

    

## Dject API and Metadata ##

### Metadata and Tagging ###

DJect supports four metadata tags.  These tags tell the system how it should manage each dependency.

- @name -- The name of the module; if not supplied, DJect will attempt to capture the name of the exported function
- @dependencies -- A list of dependencies the module requires; Default is array of function parameter names
- @singleton -- Whether the module is a singleton and should be preserved in memory; default is `false`
- @instantiable -- Whether a module is an instantiable object; default is `false`

### The DJect API ###

The DJect API is small, but powerful.  With just a short list of commands, DJect can help you manage dependencies
in a major way.

- `dject.new(config: object)` -- Create a new DJect IoC container; `var container = dject.new();`
- `container.build(moduleName: string)` -- Request a fully constructed module from the DJect container; if the module name
is not associated to a module already, DJect will reach out to the file system to create your module
- `container.buildDependencyMap(dependencies: array<string>, injectedDependencies: array<any>)` -- Zip dependency names and injected dependency array into a single object/dictionary
- `container.getDependencyTree(moduleName: string)` -- Returns a tree of all dependencies a module depends upon
- `container.getRegisteredModules()` -- Returns a list of all modules currently registered to a DJect container
- `container.loadModule(moduleName: string)` -- Loads a module into memory eagerly
- `container.new()` -- Builds new container which inherits all dependencies from parent container; subcontainer
always allows override of original dependencies, which is isolated to the scope and lifetime of the new subcontainer
- `container.override(module: object)` -- Registers module, replacing existing module; throws error on no existing module
- `container.override(module: [object])` -- Registers array of modules, replacing existing modules; throws error on no existing module
- `container.register(module: object)` -- Register a module for use as a dependency; use this for eager-loading
modules into a DJect container; throws error on duplicate module
- `container.registerModules(modules: [object])` -- Registers an array of modules at once; throws error on duplicate module

    

## Version History ##

**v2.0.0**
- Updated client import config to always provide dependencies as a single object with each dependency as a property

**v1.12.1**
- Bug fix
    - Build all module paths fails in certain circumstances
- Added `buildDependencyMap` to container for handling dependencies in minified files

**v1.11.6**
- Bug fixes
    - Fixed incorrect loading of overridden modules
    - Fixed misreporting of duplicate modules with partial name collisions
- Performance improvements around module discovery and file loading

**v1.11.0**

- Introduced globbing
    - Default file glob (when non specified) is *.js
    - Recursive glob only when specified in the config

**v1.9.2**

- Fixed bug with registering modules which are installed in node_modules

**v1.9.0**

- Added npm installed module recognition to speed the time from install to use
- Overhauled internals to use a core DI system for simpler construction

**v1.8.0**

- Updated configuration options to throw if module to be registered does not exist in the filesystem

**v1.7.0**

- Enhanced readme to show API usage examples
- Added optional module name argument to register and override

**Previous Versions**

- Initial release
- Bug fixes

    


    