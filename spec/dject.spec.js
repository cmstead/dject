var assert = require('chai').assert;

var approvalsConfig = require('./approvalsConfig/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./spec/approvals');

var dject = require('../index');
var testBase = require('./side-load-modules/testBase');


function prettyJson(obj) {
    return JSON.stringify(obj, null, 4);
}

describe('DJect', function () {

    var config;

    beforeEach(function () {
        config = {
            cwd: './spec',
            modulePaths: [
                'side-load-modules',
                'testModules'
            ]
        };
    });

    it('should be instantiable', function () {
        var container = dject.new(config);
        assert.equal(typeof container, 'object');
    });

    it('should throw if no config is provided', function () {
        assert.throws(dject.new, 'DJect requires a configuration object.');
    });

    describe('Register and manage modules', function () {

        var container;

        beforeEach(function () {
            container = dject.new(config);
        });

        describe('Register Module', function () {

            it('should throw an error if trying to register module when name is already in use', function () {
                container.register(testBase);

                assert.throws(container.register.bind(null, testBase), 'Injector Error: Cannot reregister module "testBase"');
            });

            it('should allow for registering a module', function () {
                container.register(require('./side-load-modules/testBase'));
                this.verify(prettyJson(container.build('testBase')));
            });

            it('should allow registering a module with dependencies', function () {
                container.register(require('./side-load-modules/testComposed'));
                this.verify(prettyJson(container.build('testComposed')));
            });

        });

        describe('Register Multiple Modules', function () {
            
            it('should register an array of modules', function () {
                var circularModules = require('./side-load-modules/circularModules');

                container.registerModules([
                    testBase,
                    circularModules.circular1,
                    circularModules.circular2
                ]);

                this.verify(prettyJson(container.getRegisteredModules()));
            });

        });

        describe('Build Module', function () {

            it('should throw an error if module does not exist', function () {
                assert.throws(container.build.bind(null, 'foo'), 'Injector Error: Module "foo" does not exist');
            });

            it('should throw an error if Two modules exist in defined file paths', function () {
                assert.throws(container.build.bind(null, 'duplicate'), 'Injector Error: Found duplicate module "duplicate" in paths side-load-modules, testModules');
            });

            it('should throw an error if dependency chain is too deep or circular', function () {
                var circularModules = require('./side-load-modules/circularModules');

                container.register(circularModules.circular1);
                container.register(circularModules.circular2);

                assert.throws(container.build.bind(null, 'circular1'), 'Injector Error: Dependency chain is either circular or too deep to process.');
            });

            it('should manage singleton modules correctly', function () {
                var firstInstance = container.build('testSingleton');

                assert.equal(container.build('testSingleton'), firstInstance);
            });

            it('should properly instantiate standalone objects', function () {
                this.verify(container.build('TestInstantiable').toString());
            });

            it('should load dependencies from file system if they are not pre-loaded', function () {
                this.verify(prettyJson(container.build('justInTime')));
            });

            it('should return a list of registered modules', function () {
                container.build('justInTime');
                this.verify(prettyJson(container.getRegisteredModules()));
            });
        });


    });

});