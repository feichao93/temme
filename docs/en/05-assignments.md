## Assignments

### Syntax

- `$foo = bar;` foo should be a valid JavaScript identifier; bar should be a JavaScript literal (string/number/null/boolean/RegExp).

### Running Semantics

The running semantics differs when assignments appear in different places:

- At top level: `$foo = 'bar';` means that string `'bar'` will be in `.foo` of the final result;
- In content-capture: `div.foo{ $a = null }` is like a conditional capture: if there is such a div that satisfies `.foo` qualifier, then the assignment is executed;
- In children selector, `li@list { $x = 123 }` means that every object in `list` will have `123` as the `.x` field.

### Examples

```html
<!-- html used below -->
<ul>
  <li data-fruit-id="1">
    <span data-color="red">apple</span>
  </li>
  <li data-fruit-id="2">
    <span data-color="white">pear</span>
  </li>
  <li data-fruit-id="3">
    <span data-color="purple">grape</span>
  </li>
</ul>
```

```JavaScript
temme(html, `
$top = 'level';
ul { $hasUlElement = true };
div { $hasDivElement = true };

li@array {
  $row = true;
  $isPurple = false;
  [data-color=purple]{$isPurple = true};
};`)
//=>
// {
//   "top": "level",
//   "hasUlElement": true,
//   "array": [
//     { "row": true, "isPurple": false },
//     { "row": true, "isPurple": false },
//     { "row": true, "isPurple": true }
//   ]
// }
```
