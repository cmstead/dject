# DJect

## Dependency injection for node made easy

Working with require statements violates one of the core tenants of Martin Fowler's rule for depending on abstractions
over conretions. This is because every time you require a module, you are telling Node you want precisely one file which
provides precisely one API.  To break these dependencies, you have to build factories... lots of them.

DJect is built to simplify workflow to declaring where your node modules live in your project and then simply requesting
them as needed. Any modules not loaded directly through the container.register() endpoint are lazily loaded from
the filesystem just in time to fulfill the dependency need. This means your application only loads the dependencies it
needs and you don't have to spend your time worrying about managing your dependency chain by hand with massive
factory trees.

## DJect Features

- Lazy loading of dependencies from the filesystem - only load what you need
- Eager loading of dependencies through module API
- Simple dependency chain management
- Fully sandboxed to safeguard against cross-project contamination
- Dependency management configured through attached metadata
- Easy configuration for multiple module locations
- Support for factory methods and instantiable objects

## Getting Started

DJect requires a single module to be created and cached by Node. This means your setup is as simple as creating a single 
JS file, container.js, like the following:

~~~
'use strict'

var config = {
    cwd: './spec',
    modulePaths: [
        'side-load-modules',
        'testModules'
    ],
    allowOverride: false
};

module.exports = require('dject').new(config);
~~~

Every time you require container.js, Node will capture the cached export and provide it to your requiring module.  This
guarantees your container is a singleton and will always work from the modules loaded elsewhere from within your project.
However, because your container is built within your project, no two projects will ever share the same DJect container.

### The config parameters:

- cwd -- The directory DJect will prepend all paths with; default is '.'
- modulePaths -- An array of all paths where a module might be found; default is ['modules']

## Defining DJect Consumable Modules

DJect expects that all modules will be defined either with a factory function or as an instantiable object. Let's look at
how to define each and what kinds of metadata can be attached.

### Factory Functions

~~~
'use strict';

function testComposed(testBase, otherBase) {
    return {
        testBase: testBase,
        testOtherBase: otherBase
    };
}

testComposed['@name'] = 'testComposed';
testComposed['@dependencies'] = ['testBase', 'otherBase'];
testComposed['@singleton'] = true;

module.exports = testComposed;
~~~

This module uses a factory function to close over its dependencies. Although this module is simple and only returns
an object containing its dependencies, modules can contain any logic normally contained in a Node module.  Please note
the attached metadata at the bottom declaring a name, a list of dependencies and whether it is a singleton. We will go
over these tags in greater detail later.

### Instantiable Modules

~~~
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

TestInstantiable['@instantiable'] = true;
TestInstantiable['@dependencies'] = ['testBase', 'otherBase'];

module.exports = TestInstantiable;
~~~

This module is instantiable, and it is annotated at the bottom to tell DJect as much. The instantiable tag is unique to
instantiable objects and will be covered in the next section.

### Metadata and Tagging

DJect supports four metadata tags.  These tags tell the system how it should manage each dependency.

- @name -- The name of the module; if not supplied, DJect will attempt to capture the name of the exported function
- @dependencies -- A list of dependencies the module requires; Default is array of function parameter names
- @singleton -- Whether the module is a singleton and should be preserved in memory; default is `false`
- @instantiable -- Whether a module is an instantiable object; default is `false`

## The DJect API

The DJect API is small, but powerful.  With just a short list of commands, DJect can help you manage dependencies
in a major way.

- `dject.new(config: object)` -- Create a new DJect IoC container; `var container = dject.new();`
- `container.build(moduleName: string)` -- Request a fully constructed module from the DJect container; if the module name
is not associated to a module already, DJect will reach out to the file system to create your module
- `container.getRegisteredModules()` -- Returns a list of all modules currently registered to a DJect container
- `container.override(module: object)` -- Registers module, replacing existing module; throws error on no existing module 
- `container.override(module: [object])` -- Registers array of modules, replacing existing modules; throws error on no existing module 
- `container.register(module: object)` -- Register a module for use as a dependency; use this for eager-loading
modules into a DJect container; throws error on duplicate module
- `container.registerModules(modules: [object])` -- Registers an array of modules at once; throws error on duplicate module