## 过滤器 `|`

### 语法

- `$foo|xxx` 放在值捕获的右边；xxx 是过滤器的名字
- `@bar|xxx` 放在数组捕获的右边；
- `$foo|xxx(arg1, arg2, ...)` 过滤器可以接受若干个参数；每一个参数都是一个 JavaScript 字面量；
- `$foo|f1(a,b)|f2` 过滤器可以进行串联。

### 运行时的行为

每当一个值被捕获时，该值的类型总是字符串。一个过滤器是一个简单的函数，接受一个输入（也就是捕获的值，会放在 `this` 中）与若干参数，然后返回一个输出。我们可以使用过滤器来处理捕获的值。

- `div{$x|foo}` 每当 `x` 被捕获时，它就会像这样被处理：`x = foo.apply(x)`

* `div{$x|foo(1, false)}` 每当 x 被捕获时，它就会像这样被处理：`x = foo.apply(x, [1, false])`

* `div{$x|foo|bar}` 被捕获的值首先被 foo 处理，然后会被 bar 处理。整个过程相当于以下代码：
  ```javascript
  x = foo.apply(x)
  x = bar.apply(x)
  ```

### 内建的过滤器

Temme 提供了一些内建的过滤器。这些过滤器分为下面三个部分：

1. Structure Manipulation Filters：该部分包括 `pack`，`flatten`，`compact`，`first`，`last`，`get`。这些过滤器简单又实用，看 [源代码](/packages/temme/src/filters.ts) 以了解细节。
2. Type Coercion Filters：该部分包括 `String`，`Number`，`Date`，`Boolean`。这些过滤器用于将输入转换为指定的类型。
3. Prototype Filters：我们可以使用来自原型链的方法。举个例子，如果我们可以保证 x 每次被捕获的时候其类型总是字符串, 那么我们可以安全地使用 `$x|substring(0, 20)` 或是 `$x|toUpperCase`。

### 数组过滤器语法 `||`

使用数组过滤器语法 `||`，temme 将认为捕获的值是一个数组，然后对数组中每个元素应用该过滤器。

```JavaScript
temme('<div>1 22 333 4444</div>', `div{ $|split(' ')||Number }`)
// => [1, 22, 333, 4444]
```

## 使用自定义的过滤器

temme 允许用多种方式来自定义过滤器。在自定义过滤器中，输入放在 `this` 中，保持和 Prototype Filters 一致。

### 定义全局过滤器

使用 `defineFilter` 来添加全局过滤器。

```JavaScript
import { defineFilter } from 'temme'

// 定义全局过滤器
defineFilter('myFilter', function myFilter(arg1, arg2) { /* ... */ })
```

### 将过滤器以参数的形式提供给 temme()

`temme()` 函数的第三个参数用于指定额外的过滤器。

```JavaScript
// 额外的过滤器
const extraFilters = {
  secondItem() {
    return this[1]
  },
  // ...
}
temme(html, 'div@arr|secondItem { p{$text} }', extraFilters)
```

### 内联定义的过滤器

在选择器字符串中直接定义过滤器。过滤器定义语法和 JavaScript 函数定义语法一样，区别在于将关键字 _function_ 换成了 _filter_。

```
filter myFilter(arg1, arg2, arg3) {
  // todo 用中文
  // todo 说明因为语法解析器的原因，不支持 js 解构、参数收集等语法
  /* 在这里过滤器的逻辑. */
  /* The code here will be executed as in a JavaScript function. */
  /* Note that the curly braces must be balanced here. */
}

// 我们可以这么使用myFilter
div{$txt|myFilter(x, y, z)};
```
