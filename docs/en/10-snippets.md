(TODO)

## Snippets

Snippet is a way of reusing sub-selectors in a temme-selector. It is useful when the parent-selectors vary but children selectors alike.

#### Syntax

- `@xxx = { /* selectors */ };` Define a snippet named xxx. xxx should be a valid JavaScript identifier.
- `@xxx;` Expand the snippet named xxx. It is like that we replace xxx with the content of snippet.

Snippet-define is allowed at top level only. Snippet-expand can be place at top level or in children selectors. Snippets can be nested: `A -> B -> C` (A uses B, B uses C); But snippets should not be circled.

#### Running Semantics

The running semantics of snippet is simple: when temme meets a snippet-expand, temme will replace the `@xxx` with its content.

#### Examples:

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
