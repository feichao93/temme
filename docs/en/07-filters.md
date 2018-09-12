## Filters `|`

Like many other template engines, temme supports filters to do simple data processing.

#### Syntax

- `$foo|xxx` / `@bar|xxx` Place right after a value-capture or array-capture; xxx is the filter functions name and should be a valid JavaScript identifier.
- `$foo|xxx(arg1, arg2, ...)` Filter can accept arguments. Every argument should be a JavaScript literal.
- `$foo|f1(a,b)|f2` Filters can be chained.

### Running Semantics

A filter is a simple function that receive input (access via `this`) with several arguments, and returns a single value. We use filters to process the captured value.

- `div{$x|foo}` Every time x is captured, it will be processed as `x = foo.apply(x)`;
- `div{$x|foo(1, false)}` Every time variable x is captured, it will be processed as `x = foo.apply(x, [1, false])`;
- `div{$x|foo|bar(0, 20)}` The value will first be processed by filter foo and then by filter bar. The value is processed like `x = foo.apply(x); x = bar.apply(x, [0, 20]);`.

### Built-in filters

Temme provides a few filters out of box. Built-in filters could be divided into three categories:

1.  Structure Manipulation Filters: this category includes `pack`, `flatten`, `compact`, `first`, `last`, `nth`, `get`. These functions are short but powerful. [See source for more detail](/src/filters.ts).
2.  Type Coercion Filters: this category includes `String`, `Number`, `Date`, `Boolean`. These filters converts the captured value to specific type.
3.  Prototype Filters: We can use methods on prototype chain as filters (This is why the input is supplied as `this`). For example, if we can ensure that x is always a string, then we can safely use `$x|substring(0, 20)` or `$x|toUpperCase`.

### Array-Filters Syntax `||`

Using array-filter syntax `||`, temme will treat the captured value as an array, and apply the filter to every item of this array.

```JavaScript
temme('<div>1 22 333 4444</div>', `div{ $|split(' ')||Number }`)
//=> [1, 22, 333, 4444]
```

## Customized Filters

Temme supports defining customized filter in several ways. In a customized filters, the input is accessed via `this`, which is consistent with the prototype filters.

### Global Filters Definition

Use `defineFilter` to define customized global filters.

```JavaScript
import { defineFilter } from 'temme'

// Define a global filter
defineFilter('myFilter', function myFilter(arg1, arg2) { /* ... */ })
```

### Filters as an argument of temme()

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

### Inline Filters Definition

Define filters in selector string. Inline filters definition has the same syntax as JavaScript-style function definition. The difference is that temme use _filter_ as the keyword instead of _function_.

```
filter myFilter(arg1, arg2, arg3) {
  /* Filter Logic Here. */
  /* The code here will be executed as in a JavaScript function. */
  /* Note that the curly braces must be balanced here due to parser limitations. */
}

// We can use `myFilter` like this:
div{$txt|myFilter(x, y, z)};
```
