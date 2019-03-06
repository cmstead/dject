!function(e){"use strict";"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectCoreFactory=e}(function(){var r={},t={};function i(e){return void 0!==r[e]}function o(e){if(!i(e))throw new Error("Module "+e+" has not been registered")}function u(e){return o(e),r[e]()}function d(e,o,n){return e[o]=n,e}function l(e,o,n){return r[e]=function(e,o){function n(){return e.apply(null,o.map(u))}return Object.defineProperty(n,"originalModule",{value:e,writeable:!1,configurable:!1}),d(n,"dependencies",function(){return o.slice(0)})}(o,n),t}function e(e,o){return d(e,o,r[o])}return t.build=u,t.getModuleBuilder=function(e){return r[e]},t.getModuleRegistry=function(){return Object.keys(r).reduce(e,{})},t.isRegistered=i,t.getDependencies=function(e){return o(e),r[e].dependencies()},t.override=function(e,o,n){return function(e){if(!i(e))throw new Error("Cannot override module, "+e+"; it has not been registered")}(e),l(e,o,n)},t.register=function(e,o,n){return function(e){if(i(e))throw new Error("Cannot reregister module "+e)}(e),l(e,o,n)},t}),window.djectLoaders={},function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.baseUtilsLoader=e}(function(e){"use strict";function i(e){if(void 0===e)throw new Error("Dject requires a configuration object")}function u(e,o,n){e&&n.registerAllModulesFromPaths(o)}function n(e,o){return Boolean(e)?e:o}function d(e){var o=Object.create(e);return o.allowOverride=n(e.allowOverride,!1),o.eagerLoad=n(e.eagerLoad,!1),o.errorOnModuleDNE=n(e.errorOnModuleDNE,!1),o}e.register("baseUtils",function(n,r){var o=/^.+\.js$/;function t(e){return o.test(e)?e:e+r.sep+"*.js"}return{buildLocalConfig:d,buildModulePaths:function(e){var o;return(void 0!==(o=e).modulePaths?o.modulePaths.map(function(e){return r.join(o.cwd,e)}):[]).map(t).map(function(e){return n.sync(e)}).reduce(function(e,o){return e.concat(o)},[])},throwOnBadConfig:i,performEagerLoad:u}},["glob","path"])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.containerFactoryLoader=e}(function(e){"use strict";var o="undefined"!=typeof module&&void 0!==module.exports?require("dject-core"):window.djectCoreFactory;e.register("containerFactory",function(){return o},[])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.djectLoader=e}(function(e){"use strict";e.register("dject",function(s,a,f,p,m,g,w){return{new:function t(e){s.throwOnBadConfig(e);var i=s.buildLocalConfig(e),n=s.buildModulePaths(i),u=a(),d=w(n,u),o=p(u,d);function r(e){if(o=e,i.errorOnModuleDNE&&!f.isFileInPaths(n,o)&&null===m.loadInstalledModule(o))throw new Error("Cannot register module that does not exist in filesystem; errorOnModuleDNE is set to true");var o}function l(e,o){return"string"==typeof o?o:g.getModuleName(e)}s.performEagerLoad(i.eagerLoad,n,d);var c={build:o.build,buildDependencyMap:function(e,r){return e.reduce(function(e,o,n){return e[o]=r[n],e},{})},getRegisteredModules:d.getRegisteredModules,getDependencyTree:function e(o){d.loadModule(o);var n=d.getModuleBuilder(o),r=n.dependencies();return{name:o,instantiable:Boolean(n["@instantiable"]),singleton:Boolean(n["@singleton"]),dependencies:r.map(e)}},loadModule:d.loadModule,new:function(){var e,o,n=t((e=i,(o=Object.create(e)).allowOverride=!0,o)),r=u.getModuleRegistry();return Object.keys(r).forEach(function(e){if("__container"!==e){var o=r[e];n.register(o.originalModule,e)}}),n},override:function(e,o){var n=l(e,o);!function(){if(!i.allowOverride)throw new Error("Cannot override module, allowOverride is set to false.")}(),r(n),d.override(e,n)},register:function(e,o){r(l(e,o)),d.registerModule(e,o)},registerModules:d.registerModules};return d.registerModule(function(){return c}),c}}},["baseUtils","containerFactory","fileLoader","moduleBuilderFactory","moduleLoader","moduleUtils","registryFactory"])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.fileLoaderLoader=e}(function(e){e.register("fileLoader",function(e,o,r){function d(n){return function(e){var o=r.join(n,e);return require(o)}}function l(e){var o=e.split(/[\/\\]/);return o.slice(0,o.length-1).join(r.sep)}return{isFileInPaths:function(e,o){var n=o+".js";return 0<e.filter(function(e){return e.endsWith(n)}).length},loadFileFromPaths:function(e,o){var n=o+".js",r=new RegExp("[\\/\\\\]"+o+"\\.js$","i"),t=e.filter(function(e){return r.test(e)});if(1<t.length){var i="Cannot load module, "+o+"; duplicate modules exist in the following paths: "+t.join(",");throw new Error(i)}var u=0<t.length?l(t[0]):null;return null!==u?d(u)(n):null},loadAllFilesFromPaths:function(e){return e.map(function(e){var o=e.split(/[\/\\]/).pop();return d(l(e))(o)})}}},["fs","glob","path"])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.moduleBuilderFactoryLoader=e}(function(e){"use strict";e.register("moduleBuilderFactory",function(){return function(n,o){function r(e){n.isRegistered(e)||o.loadModule(e)}function t(e){return r(e),function o(e){n.getDependencies(e).forEach(function(e){r(e),o(e)})}(e),n.build(e)}return{build:function(e){try{return t(e)}catch(e){var o="An error occurred while processing dependencies: "+e.message;throw new Error(o)}}}}},[])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.moduleLoaderLoader=e}(function(e){e.register("moduleLoader",function(){return{loadInstalledModule:function(e){var o=e.replace(/([A-Z])/g,"-$1").toLowerCase();try{return require(o)}catch(e){return null}}}},[])});var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.moduleUtilsLoader=e}(function(e){"use strict";e.register("moduleUtils",function(){function t(e){var o=e["@name"];return"string"==typeof o?o:e.name}function o(e){return function(o){try{return e=o.toString(),null!==(r=e.match(/function\s.*?\(([^)]*)\)/))?r[1]:e.match(/.*\(([^)]*)\)\s*\=\>/)[1]}catch(e){var n="Unable to parse arguments from function or expression: "+t(o);throw new Error(n)}var e,r}(e).replace(/\/\*.*\*\//,"").split(",").map(function(e){return e.trim()}).filter(function(e){return 0<e.length})}function n(e){return function(e){var o="Cannot register module. Expected function, but got "+(void 0===e?"undefined":_typeof(e))+" with value "+JSON.stringify(e,null,4);if("function"!=typeof e)throw new Error(o)}(e),"object"===_typeof(e["@dependencies"])?e["@dependencies"]:"function"==typeof e.dependencies?e.dependencies():o(e)}return{getModuleDependencies:n,getModuleName:t,getModuleInfo:function(e,o){return{dependencies:n(e),name:"string"==typeof o?o:t(e)}}}},[])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.moduleWrapperLoader=e}(function(e){"use strict";e.register("moduleWrapper",function(){function o(n){var r=null;function e(){var e,o;return r=null===r?(e=arguments,o=Array.prototype.slice.call(e,0),n.apply(null,o)):r}return e["@singleton"]=!0,e["@dependencies"]=n["@dependencies"],e}return{wrapSpecialModule:function(e){return e["@singleton"]?o(e):e["@instantiable"]?function(n){function e(){var e=Array.prototype.slice.call(arguments,0),o=Object.create(n.prototype);return n.apply(o,e),o}return e["@instantiable"]=!0,e["@dependencies"]=n["@dependencies"],e}(e):e}}},[])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.registryLoader=e}(function(e){"use strict";e.register("registryFactory",function(c,s,a,f){return function(u,d){function l(e,o){var n=a.getModuleInfo(e,o),r=n.dependencies,t=n.name,i=f.wrapSpecialModule(e);d.register(t,i,r)}return{getModuleBuilder:d.getModuleBuilder,getRegisteredModules:function(){var e=d.getModuleRegistry();return Object.keys(e)},loadModule:function(e){var o,n,r,t,i;d.isRegistered(e)||(o=u,n=e,null!==(r=c.loadFileFromPaths(o,n))&&l(r)),d.isRegistered(e)||(t=e,null!==(i=s.loadInstalledModule(t))&&l(function(){return i},t))},override:function(e,o){var n=a.getModuleInfo(e,o),r=n.dependencies,t=n.name,i=f.wrapSpecialModule(e);d.override(t,i,r)},registerAllModulesFromPaths:function(e){c.loadAllFilesFromPaths(e).forEach(l)},registerModule:l,registerModules:function(e){e.forEach(l)}}}},["fileLoader","moduleLoader","moduleUtils","moduleWrapper"])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.fsLoader=e}(function(e){"use strict";function o(){throw new Error("Cannot load filesystem modules when not in NodeJS environmet")}e.register("fs",function(){var e={readdirSync:o,lstatSync:o};return"undefined"!=typeof module&&void 0!==module.exports?require("fs"):e},[])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.globLoader=e}(function(e){"use strict";function n(){throw new Error("Cannot load filesystem modules when not in NodeJS environmet")}e.register("glob",function(){var e="undefined"!=typeof module&&void 0!==module.exports;function o(){n()}return o.sync=n,e?require("glob"):o},[])}),function(e){"undefined"!=typeof module&&void 0!==module.exports?module.exports=e:window.djectLoaders.pathLoader=e}(function(e){"use strict";var o="undefined"!=typeof module&&void 0!==module.exports;e.register("path",function(){return o?require("path"):null},[])}),function(){"use strict";var e="undefined"!=typeof module&&void 0!==module.exports,o=e?require("./coreContainer"):window.djectCoreFactory();e?module.exports=o.build("dject"):(Object.keys(window.djectLoaders).forEach(function(e){window.djectLoaders[e](o)}),window.djectLoaders=void 0,window.dject=o.build("dject"))}();