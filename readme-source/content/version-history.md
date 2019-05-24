<!--bl
(filemeta
    (title "Version History"))
/bl-->

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
