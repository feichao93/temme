## Snippets

Snippet is a way of reusing selectors in temme selectors. It is useful when the parent-selectors vary but children selectors alike.

### Syntax

- `@xxx = { /* selectors */ };` Define a snippet named xxx. xxx should be a valid JavaScript identifier.
- `@xxx;` Expand the snippet named xxx.

Snippet-define is allowed at top level only. Snippet-expand can be place at top level or in children selectors. Snippets can be nested: `A -> B -> C` (A uses B, B uses C); But snippets should not be circled.

### Running Semantics

The running semantics of snippet is simple: when temme meets a snippet-expand, temme will replace the `@xxx` with its content.

### Example-1

In the online shopping mall, reviews of an item can be divides into two types: premiere reviews and appended reviews. These two types of reviews has the same DOM structure in the web page but mounts into different parent node. [This example](https://temme.js.org/?example=tmall-reviews-Chinese) defines a snippet that captures a list of reviews, then uses the snippet to capture premiere reviews and appended reviews respectively.

### Example-2

Note that this example is made up and the selector does not work with the real StackOverflow html. A StackOverflow question asked by _person-A_ may be edited by _person-B_. Without snippets, our temme-selector is:

```
.ask-info@asked|pack {
  .time[title=$actionTime];
  .username{$username};
  .reputation{$reputation};
};
.edit-info@edited|pack {
  .time[title=$actionTime];
  .username{$username};
  .reputation{$reputation};
};
```

The children selectors in curly brace are duplicated. We can use snippet to deduplicate them:

```
@personInfo = {
  .time[title=$actionTime];
  .username{$username};
  .reputation{$reputation};
};
.ask-info@asked|pack { @personInfo; };
.edit-info@edited|pack { @personInfo; };
```
