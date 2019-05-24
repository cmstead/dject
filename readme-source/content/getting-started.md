<!--bl
(filemeta
    (title "Getting Started"))
/bl-->

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
