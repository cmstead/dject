<!--bl
(filemeta
    (title "Getting Started"))
/bl-->

DJect requires a single module to be created and cached by Node. This means your setup is as simple as creating a single JS file, container.js, like the following:

~~~
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
    errorOnModuleDNE: false
};

module.exports = require('dject').new(config);
~~~

Every time you require container.js, Node will capture the cached export and provide it to your requiring module.  This
guarantees your container is a singleton and will always work from the modules loaded elsewhere from within your project.
However, because your container is built within your project, no two projects will ever share the same DJect container.
