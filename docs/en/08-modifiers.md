## Modifiers `!`

Modifiers are used for writing the processed value into the result.

### Syntax

- `$foo!mod` Placed after value-capture; mod is the name of modifier function
- `@foo!mod` Placed after array-capture
- `$foo!mod(arg1, arg2)` Accepts several arguments; Every argument should be a simple JavaScript literal
- `$foo|filter1!mod` Used along with the filters

### Running Semantics

Modifiers are used for writing the processed value into the result. Every mutation of capture-result is done through a modifier. When we omit the modifier, temme will use `!add` as the default modifier, to add the captured value into capture-result. The default `!add` is implemented as follows:

```TypeScript
function add(result: CaptureResult, key: string, value: any) {
  if (value != null && !isEmptyObject(value)) {
    result.set(key, value)
  }
}
```

`!add` ignores null and empty objects, and then call `CaptureResult#set` which writes value into the specified field. The documentation for `CaptureResult` can be viewed [at the bottom of this page](#class-captureresult). We can use other modifiers instead of the default `!add`. Temme provides several built-in modifiers, and we can define customized modifiers like defining customized filters.

### Built-in Modifiers

Temme provides the following modifiers:

- `!add` The most basic and most used modifier, it ignores null and empty objects, then add the captured value into the result
- `!forceAdd` Like `!add`, but ignores nothing. It is the default modifier in assignments.
- `!array` Collects the value into an array. See [this example](https://temme.js.org?example=modifier-array) for detail.
- `!candidate` Like `!add`, but write to the result only when the existing value at that key is falsy. See [this example](https://temme.js.org?example=modifier-candidate) for detail.

## Customized Modifiers

Like in filters, temme allows us to define customized modifiers in several ways. When a customized modifier is called, the argument are as follows: capture-result, capture key, captured value, arguments passed to the modifier in selector. [The built-in modifiers](/packages/temme/src/modifiers.ts) could be a good reference before you define your own customized modifiers.

### Global Modifier Definition

```JavaScript
import { defineModifier } from 'temme'

defineModifier('myModifier', function myModifier(result, key, value, ...args) {
  /* ... */
})
```

### Modifiers as an argument of temme()

The fourth argument of `temme()` is for specifying customized modifiers. In the following code, we define `!reverse`, a modifier that reverses the capture key (though useless indeed).

```JavaScript
const extraModifiers = {
  reverse(result, key, value) {
    result.set(key.split('').reverse().join(''), value)
  },
  // ...
}
temme(html, 'div{ $foo!reverse }', /* extraFilters */ null, extraModifiers)
//=> { oof: ... }
```

### Inline Modifiers Definition

Define modifiers in selector string. Inline modifiers definition has the same syntax as JavaScript-style function definition. The difference is that temme use `modifier` as the keyword instead of `function`. [Online Example](https://temme.js.org/?example=modifier-reverse)

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

`CaptureResult` is used for store the captured result. In modifiers, we normally call its `set` method to write value into it; In [procedures](/docs/en/09-procedures.md), we usually call its `add` method to add value-capture.

| API                              | Description                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `result.get(key)`                | Return the corresponding value stored in the result                                                          |
| `result.set(key, value)`         | Set value at key directly                                                                                    |
| `result.add(capture, value)`     | Add value-capture to the result; value will be processed by filters and modifiers before written into result |
| `result.forceAdd(capture,value)` | Same as `add`, but use `!forceAdd` as the default modifier                                                   |
| `reuslt.getResult()`             | Result the captured values                                                                                   |
