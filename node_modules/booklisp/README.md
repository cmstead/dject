
# Booklisp #
#### A Language for Building Documents ####

## Table Of Contents ##

- [Section 1: Introduction](#user-content-introduction)
- [Section 2: Setup and Running](#user-content-setup-and-running)
- [Section 3: Examples](#user-content-examples)
- [Section 4: To Dos](#user-content-to-dos)
- [Section 5: Release History](#user-content-release-history)

## Introduction ##

#### What Booklisp Is ####

Booklisp is a language for people who want the compositional support LaTeX provides, but with the ease of Markdown authoring. Although Booklisp is still in the developmental stages, it is still possible to build large, complex documents without setting your hair on fire.

Booklisp content is just Markdown.  Any Booklisp Markdown is valid Github Flavored Markdown (GFM) with embedded HTML comments.

Booklisp executable blocks are a simple DSL utilizing Lisp-style syntax, making the work of composing complex documents little more than declaring what you want... and a few parens.

This readme was even created with Booklisp!

#### What Booklisp Is Not ####

Booklisp is NOT a complete, standalone language.  It is simply designed to make the process of compiling documents simpler for authors.

Booklisp is NOT a replacement for LaTeX.  If you need the power, the language exists for a reason.

Booklisp is NOT finished.  It is likely the project will continue to grow over time.  To see the current state of the project it is worth having a look at the todo list.

#### How to Find Me ####

Find me online:
- [@cm_stead](https://twitter.com/cm_stead)
- [ChrisStead.com](http://www.chrisstead.com)
    

## Setup and Running ##

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
    

## Examples ##

The best example of Booklisp is to simply look at the source files for the readme doc you are reading right now.  Here is the main source file as I write this examples file:

```
<!--bl
(filemeta
    (title "Booklisp")
    (subtitle "A Language for Building Documents"))

(table-of-contents
    (section-main "./readme-source/sections/introduction.md")
    (section-main "./readme-source/sections/setup-and-running.md")
    (section-main "./readme-source/sections/examples.md")
    (section-main "./readme-source/sections/todos.md")
    (section-main "./readme-source/sections/release-history.md")
)/bl-->
```

In this example, the file metadata -- filemeta -- contains a title, "Booklisp", and a subtitle "A Language for Building Documents".  The main source file also contains a table of contents which captures information about the chapters contained within the document.

Each of the identifiers here is a function:
- filemeta
- title
- subtitle
- table-of-contents
- section-main

This means you can simply type what you mean and the compiler will interpret and create your document. Each document must contain a filemeta expression. All arguments to filemeta are optional.

Here's what a section-main file looks like:

```
<!--bl
(filemeta
    (title "My Chapter"))
/bl-->

In this section, we look at an example of a section-main. ;-)
```

Content can be included as either a section, section-main, or chapter; both inside and outside the table of contents:

```
<!--bl
(table-of-contents
    (chapter "./myChapter.md")
    (section-main "./mySectionMain.md"))
    (section "./mySection.md"))

(chapter "./notInTableOfContentsChapter.md")
(section-main "./notInTableOfContentsSectionMain.md")
(section "./notInTableOfContentsSection.md")
/bl-->
```

Also, if you want to write an example of a Booklisp executable block, use the noexec escape sequence:

```
<!--noexec
<!--bl
(define! "do-not-execute" "This will not execute.")
/bl-->
/noexec-->
```

**Inserting Build Messages**

If you want to print something out during the process of building, a build message can be inserted:

```
<!--bl
(build-message "This is a build message")
/bl-->
```

That's it!
    

## To Dos ##

Upcoming Todos:
- [x] Section (non-chapter) content
- [x] Standalone section and chapter content (no table-of-contents function required)
- [ ] Bibliographic Tooling
- [ ] Non-chapter/section table of contents items, e.g. introduction, appendix, etc.
    

## Release History ##

**v1.7.0**

- Introduced `subsection-minor` type content

**v1.6.0**

- Introduced `subsection` type content

**v1.4.0**

- Introduced `section-main` type content

**v1.3.0**

- Introduced `section` type content
- Renders sections and chapters from outside a table of contents

**v1.2.3**

- First readme complete

**v1.2.2**

- Fixed bug in noexec command

**1.2.0**

- Introduced noexec command

**1.1.0**

- Removed requirement that table-of-contents receive a vector of chapters

**1.0.0**

- First release
    

    