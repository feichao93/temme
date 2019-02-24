## Multiple Selectors

Temme supports multiple selectors at top-level and in children selectors (sub-selectors of an array-capture). Every selector should end with a semicolon. However when the selector ends with a closing curly brace, the semicolon is optional.

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
// multiple selectors at the top level
temme(html, ` [data-color=red]{$name};
              [data-fruit-id="3"] [data-color=$color]; `)
//=> { "name": "apple", "color": "purple" }

// multiple children selectors in a array-selector
temme(html, `
  li@ {
    span[data-color=$color];
    span{$name};
  }`)
//=>
// [
//   { "color": "red", "name": "apple" },
//   { "color": "white", "name": "pear" },
//   { "color": "purple", "name": "grape" },
// ]
```
