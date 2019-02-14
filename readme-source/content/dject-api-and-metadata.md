<!--bl
(filemeta
    (title "Dject API and Metadata"))
/bl-->

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
