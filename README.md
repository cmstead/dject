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