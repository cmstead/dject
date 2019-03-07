<!--bl
(filemeta
    (title "Examples"))

(build-message "Adding examples documentation")
/bl-->

The best example of Booklisp is to simply look at the source files for the readme doc you are reading right now.  Here is the main source file as I write this examples file:

<!--noexec
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
/noexec-->

In this example, the file metadata -- filemeta -- contains a title, "Booklisp", and a subtitle "A Language for Building Documents".  The main source file also contains a table of contents which captures information about the chapters contained within the document.

Each of the identifiers here is a function:
- filemeta
- title
- subtitle
- table-of-contents
- section-main

This means you can simply type what you mean and the compiler will interpret and create your document. Each document must contain a filemeta expression. All arguments to filemeta are optional.

Here's what a section-main file looks like:

<!--noexec
```
<!--bl
(filemeta
    (title "My Chapter"))
/bl-->

In this section, we look at an example of a section-main. ;-)
```
/noexec-->

Content can be included as either a section, section-main, or chapter; both inside and outside the table of contents:

<!--noexec
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
/noexec-->

Also, if you want to write an example of a Booklisp executable block, use the noexec escape sequence:

<!--noexec
```
<!--noexec
<!--bl
(define! "do-not-execute" "This will not execute.")
/bl-->
/noexec-->
```
/noexec-->

**Inserting Build Messages**

If you want to print something out during the process of building, a build message can be inserted:

<!--noexec
```
<!--bl
(build-message "This is a build message")
/bl-->
```
/noexec-->

That's it!