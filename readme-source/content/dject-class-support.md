<!--bl
(filemeta
    (title "Dject Class Support")
)
/bl-->

Dject comes with a class which can be extended for setting up Javascript and Typescript classes. Here is an example of what it looks like to create an injectable class:

**Note** This requires either Typescript or Node v12 or above.

```javascript
import Dject from 'dject/Dject.mjs';

class MyObject extends Dject {
    static '@dependencies' = [
        'dependency1',
        'dependency2'
    ];
    
    // Required to properly build an instance
    static build (dependencies) {
        Dject.build(MyObject, dependencies);
    }
}

export default Dject.buildMetadata(MyObject);
```
