## Modifiers `!`

Filters are used for processing the captured value, and modifiers are used for executing the action of writing the processed value into the result.

### Syntax

- `$foo!xxx` Placed after value-capture; xxx is the name of modifier function
- `@foo!xxx` Placed after array-capture
- `$foo!xxx(arg1, arg2)` Accepts several arguments; Every argument should be a temme-supported JavaScript literal
- `$foo|filter1|filter2|xxx` Used with the filters,

### Running Semantics

Modifiers are used for executing the action of writing the processed value into the result. All the mutations to the capture-result are executed through the modifiers. When we omit the modifier, temme will use `add` as the default modifier, to add the captured value into capture-result. The default `add` is implemented as follows:

```JavaScript
function add(result, key, value) {
  if (value != null && !isEmptyObject(value)) {
    result.set(key, value)
  }
}
```

`!add` ignores null and empty objects, and then call `CaptureResult#set` that writes value into the specified field. The documentation for `CaptureResult` can be viewed at the bottom of this page. We can use other modifiers instead of the default `!add`. Temme provides several built-in modifiers, and we can define customized modifiers as filters.

### Built-in Modifiers

Temme provides the following modifiers:

- `!add` The most basic and most used modifier, it ignores null and empty objects, then add the captured value into the result

- `!forceAdd` Like `!add`, but ignores nothing. It is the default modifier in assignments.

- `!array` Collects the value into an array. See [this example](https://temme.js.org?example=modifier-array) for detail.

- `!candidate` Like `!add`, but write to the result only when the existing value at that key is falsy. See [this example](https://temme.js.org?example=modifier-spread) for detail.

## Customized Modifiers

Like filters, temme allows to define customized modifiers in several ways. When a customized modifier is called, the argument are as follows: capture-result, capture key, captured value, arguments passed to the modifier in selector. [The built-in modifiers](/packages/temme/src/modifiers.ts) could be a good reference before you define your own customized modifiers.

### Global Modifier Definition

```JavaScript
import { defineModifier } from 'temme'

defineModifier('myModifier', function myModifier(result, key, value, ...args) {
  /* ... */
})
```

### Modifiers as an argument of temme()

The fourth argument of `temme()` is for specify customized modifiers。In the following code, we define `!reverse`, a modifier that reverses the capture key (though useless indeed).

```JavaScript
const extraModifiers = {
  reverse(result, key, value) {
    result.set(key.split('').reverse().join(''), value)
  },
  // ...
}
temme(html, 'div{ $foo!reverse }', null, extraModifiers)
//=> { oof: ... }
```

Provide a customized filter map as the third argument of `temme`.

```JavaScript
// Pass extraFilters as the third argument
const extraFilters = {
  secondItem() {
    return this[1]
  },
  /* more customized filters here */
}
temme(html, 'div@arr|secondItem { p{$text} }', extraFilters)
```

### Inline Modifiers Definition

Define filters in selector string. Inline modifiers definition has the same syntax as JavaScript-style function definition. The difference is that temme use _modifier_ as the keyword instead of _function_. [Online Example](https://temme.js.org/?example=modifier-reverse)

```javascript
modifier reverse(result, key, value) {
  /* Modifier logic here */
  /* The code here will be executed like in a JavaScript function */
  /* Note that the curly braces must be balanced here due to parser limitations. */
  result.set(key.split('').reverse().join(''), value)
}

// Use reverse like below
div{ $foo!reverse };
```

## Class `CaptureResult`

`CaptureResult` is used for store the captured valued. In modifiers, we normally call its `set` method to write value into it; In procedures, we call its `add` method to add value-capture.

| API                              | Description                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `result.get(key)`                | Return the corresponding value stored in the result                                                          |
| `result.set(key, value)`         | Set value at key directly                                                                                    |
| `result.add(capture, value)`     | Add value-capture to the result; value will be processed by filters and modifiers before written into result |
| `result.forceAdd(capture,value)` | Same as `add`, but use `!forceAdd` as the default modifier                                                   |
| `reuslt.getResult()`             | Result the captured values                                                                                   |
