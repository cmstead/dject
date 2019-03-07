<!--bl
(filemeta
    (title "Setup and Running"))
/bl-->

### Setup ###

Setting up Booklisp is simple:

1. Make sure you have node installed on your computer
2. Install Booklisp with npm:
    - Windows: `npm i booklisp -g`
    - Mac/Linux: `sudo npm i booklisp -g`

### Running ###

After installing Booklisp, you can compile documents like this:

1. Open a terminal window and go to the directory where your markdown source is
2. Run `booklisp` on your markdown source.  Just provide the main source file where your table of contents is:
    - `booklisp ./my-markdown-main-source.md ./my-compiled-markdown.md`

### Advanced Setup ###

You can create a build script that remembers all of your file paths if you like.  This is what the Booklisp readme build script (it's Javascript) looks like:

```javascript
'use strict';

const childProcess = require('child_process');

childProcess.exec('booklisp ./readme-source/readme.md ./README.md', function(error) {
    if(error) {
        console.log('An error occurred: ', error.message);
    } else {
        console.log('Compile complete');
    }
});
```

That's all there is to know!