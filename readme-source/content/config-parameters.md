<!--bl
(filemeta
    (title "Configuration Parameters"))
/bl-->

- cwd -- The directory DJect will prepend all paths with; default is '.'
- modulePaths -- An array of all paths where a module might be found; file globbing is allowed
- allowOverride -- Configure whether overriding a module is permitted from within the container scope; default is false
- eagerLoad -- Tells DJect to eagerly load all modules in provided directories; default is false
- errorOnModuleDNE -- Throws an error if user attempts to register a module which does not exist in the filesystem; default is false
- dependenciesAsObject -- Provides dependencies as properties on a single object; this will change the way all dependencies are provided throughout your application