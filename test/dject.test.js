var assert = require('chai').assert;

require('./testUtils/approvalsConfig');

var dject = require('../index');
var testBase = require('./side-load-modules/testBase');
var circular1 = require('./side-load-modules/circular1');
var circular2 = require('./side-load-modules/circular2');


function prettyJson(obj) {
    return JSON.stringify(obj, null, 4);
}

describe('DJect', function () {

    var config;

    beforeEach(function () {
        config = {
            cwd: __dirname,
            modulePaths: [
                'side-load-modules',
                'testModules/**/*.js'
            ]
        };
    });

    it('should be instantiable', function () {
        var container = dject.new(config);
        assert.equal(typeof container, 'object');
    });

    it('should throw if no config is provided', function () {
        assert.throws(dject.new, 'Dject requires a configuration object');
    });

    it('should eager load modules when eagerLoad is set in config', function () {
        var eagerConfig = Object.create(config);

        eagerConfig.eagerLoad = true;
        eagerConfig.modulePaths = [
            'extraTestModules',
            'side-load-modules'
        ];

        var container = dject.new(eagerConfig);

        this.verify(prettyJson(container.getRegisteredModules()));
    });

    describe('Provide modules as a single object', function() {
        let container;

        beforeEach(function() {
            function singleDependency() {
                return 'expect me';
            }

            function objectAcceptingDependency() {
                console.log(arguments);
                return {
                    dependencies: arguments[0]
                };
            }

            objectAcceptingDependency['@dependencies'] = [
                'singleDependency'
            ];

            const configCopy = Object.create(config);
            configCopy.dependenciesAsObject = true;

            container = dject.new(configCopy);

            container.register(singleDependency);
            container.register(objectAcceptingDependency);
        });

        it('passes an object for dependencies', function () {
            const newObject = container.build('objectAcceptingDependency');

            assert.equal(JSON.stringify(newObject.dependencies), '{"singleDependency":"expect me"}');
        });
    });

    describe('Register and manage modules', function () {

        var container;

        beforeEach(function () {
            container = dject.new(config);
        });

        describe('Register Module', function () {

            it('should throw an error if trying to register module when name is already in use', function () {
                container.register(testBase);

                assert.throws(container.register.bind(null, testBase), 'Cannot reregister module testBase');
            });

            it('should allow for registering a module', function () {
                container.register(require('./side-load-modules/testBase'));
                this.verify(prettyJson(container.build('testBase')));
            });


            it('should register a module defined with an arrow function', function () {
                container.register(() => ({ foo: 'bar' }), 'arrowModule');
                this.verify(prettyJson(container.build('arrowModule')));
            });

            it('should allow registering a module with dependencies', function () {
                container.register(require('./side-load-modules/testComposed'));
                this.verify(prettyJson(container.build('testComposed')));
            });

            it('should throw an error if value is not a function', function () {
                function register() {
                    container.register({ foo: 'bar' });
                }

                assert.throws(register, 'Cannot register module. Expected function, but got object with value');
            });

            it('should throw an error when a module does not exist in the filesystem and the setting is set to check for existance', function () {
                const testConfig = {
                    cwd: './test',
                    modulePaths: [
                        'testModules'
                    ],
                    errorOnModuleDNE: true
                };

                const container = dject.new(testConfig);

                const expectedError = 'Cannot register module that does not exist in filesystem; errorOnModuleDNE is set to true'
                assert.throws(container.register.bind(null, function myDependency() { }), expectedError);
            });

            it('should not throw an error when a module exists in node_modules and the setting is set to check for existance', function () {
                const testConfig = {
                    cwd: './test',
                    modulePaths: [
                        'testModules'
                    ],
                    errorOnModuleDNE: true
                };

                const container = dject.new(testConfig);

                assert.doesNotThrow(container.register.bind(null, function testModule() { }));
            });

            it('should not throw an error when a module exists in the filesystem and the setting is set to check for existance', function () {
                const testConfig = {
                    cwd: __dirname,
                    modulePaths: [
                        'testModules'
                    ],
                    errorOnModuleDNE: true
                };

                const container = dject.new(testConfig);

                assert.doesNotThrow(container.register.bind(null, function justInTime() { }));
            });

        });

        describe('Register Multiple Modules', function () {

            it('should register an array of modules', function () {
                container.registerModules([
                    testBase,
                    circular1,
                    circular2
                ]);

                this.verify(prettyJson(container.getRegisteredModules()));
            });

        });

        describe('Get Dependency Tree', function () {

            it('should build a single-layer dependency tree', function () {
                this.verify(prettyJson(container.getDependencyTree('testBase')));
            });

            it('should build a multi-layer dependency tree', function () {
                this.verify(prettyJson(container.getDependencyTree('justInTime')));
            });

        });

        describe('Build Module', function () {

            it('should throw an error if module does not exist', function () {
                assert.throws(container.build.bind(null, 'foo'), 'Module foo has not been registered');
            });

            it('should throw an error if Two modules exist in defined file paths', function () {
                const message = 'Cannot load module, duplicate; duplicate modules exist in the following paths: ';
                assert.throws(container.build.bind(null, 'duplicate'), message);
            });

            it('should throw an error if dependency chain is too deep or circular', function () {
                this.timeout(6000);

                container.loadModule('circular1');
                container.loadModule('circular2');

                assert.throws(container.build.bind(null, 'circular1'), 'An error occurred while processing dependencies: Maximum call stack size exceeded');
            });

            it('should manage singleton modules correctly', function () {
                var firstInstance = container.build('testSingleton');

                assert.equal(container.build('testSingleton'), firstInstance);
            });


            describe('instantiable modules', function () {
                it('should properly instantiate standalone objects', function () {
                    const constructedModule = container.build('TestInstantiable');

                    this.verify(constructedModule.toString());
                });

                it('constructs a dependency tree with an instantiable object in the middle', function () {
                    function localTestModule(TestInstantiable) {
                        return {
                            doTheThing: () => TestInstantiable.getObjs()
                        }
                    }

                    container.register(localTestModule);

                    const constructedModule = container.build('localTestModule');

                    this.verify(JSON.stringify(constructedModule.doTheThing(), null, 4));
                });

                it('constructs an instantiable module with no dependencies', function () {
                    const constructedModule = container.build('NoDependenciesTestInstantiable');

                    constructedModule
                        .add('foo', 'bar')
                        .add('baz', 'quux');

                    assert.equal(constructedModule.get('baz'), 'quux');
                });

                it('constructs a dependency tree with an instantiable object in the middle with no dependencies', function () {
                    function localTestModule(NoDependenciesTestInstantiable) {
                        return {
                            doTheThing: function () {
                                NoDependenciesTestInstantiable
                                    .add('foo', 'bar')
                                    .add('baz', 'quux');

                                return NoDependenciesTestInstantiable.get('foo');
                            }
                        }
                    }

                    container.register(localTestModule);

                    const constructedModule = container.build('localTestModule');

                    assert.equal(constructedModule.doTheThing(), 'bar');
                });


            });


            it('should load dependencies from file system if they are not pre-loaded', function () {
                this.verify(prettyJson(container.build('justInTime')));
            });

            it('should load module from node_modules if not in filesystem', function () {
                const testResult = container.build('testModule');

                assert.equal(testResult.getContent(), 'Module has been loaded!');
            });

            it('should return a list of registered modules', function () {
                container.build('justInTime');
                this.verify(prettyJson(container.getRegisteredModules()));
            });
        });

        describe('New subcontainer', function () {

            it('should preregister all currently loaded modules', function () {
                container.build('justInTime');
                var subcontainer = container.new();

                this.verify(prettyJson(subcontainer.getRegisteredModules()));
            });

            it('should allow overrides of dependencies', function () {
                container.build('justInTime');
                var subcontainer = container.new();

                assert.doesNotThrow(subcontainer.override.bind(null, function justInTime() { }));
            });

            it('should consume overriding dependencies', function () {
                container.build('justInTime');

                container.register(function testModule(justInTime) {
                    function doSomeStuff() {
                        justInTime.doStuff();
                    }
                    return {
                        doSomeStuff: doSomeStuff
                    };
                });
                var subcontainer = container.new();

                var overridingModuleUsed = false;

                subcontainer.override(function justInTime() {
                    function doStuff() {
                        overridingModuleUsed = true;
                    }

                    return {
                        doStuff: doStuff
                    };
                });

                const testModule = subcontainer.build('testModule');

                testModule.doSomeStuff();

                assert.isTrue(overridingModuleUsed);
            });

        });

        describe('__container', function () {

            it('is available as a dependency from a container', function () {
                const __container = container.build('__container');

                assert.equal(container, __container);
            });

            it('is always the current container, even as a child', function () {
                const childContainer = container.new();
                const __container = childContainer.build('__container');

                assert.equal(childContainer, __container);
            });

        });

    });

});
