## Modifiers `!`

filters 用于转换数据，而 modifiers 则用来执行 **将处理后的数据写入到结果** 的动作。

### 语法

- `$foo!xxx` 放在捕获的右边；xxx 是 modifier 的名字
- `@foo!xxx` 也可以放在数组捕获的右边
- `$foo!xxx(arg1, arg2)` 可以接受若干参数；每一个参数都是一个 temme 支持的 JavaScript 字面量
- `$foo|filter1|filter2!xxx` 可以和过滤器一起使用，但需要放在过滤器的后面

### 运行时行为

modifier 用来执行 **将处理后的数据写入到结果** 的动作。所有对捕获结果的修改（除了在自定义 procedure 中直接修改之外）都是通过 modifier 完成的。当我们不提供 modifier 时，temme 会使用默认的 `add` modifier，来向结果中添加捕获到的值。默认的 `add` modifier 的实现如下。

```JavaScript
function add(result, key, value) {
  if (value != null && !isEmptyObject(value)) {
    result.set(key, value)
  }
}
```

`!add` 会忽略 null 和空对象，然后调用 `CaptureResult#set` 方法将值写入对应字段中。`CaptureResult` 的 API 文档见本页最下方。我们可以使用其他 modifier 来覆盖默认的 `!add`。temme 提供了若干个内置的 modifier，我们也可以像 filter 一样自定义 modifier。

### 内置的 modifiers

Temme 提供了以下几个 modifiers 来完成一些常见的操作。如果你有经常使用的 modifier，并且该 modifier 有一定的通用性，欢迎提 issue 让它成为内置 modifier。

- `!add` 是最常用的 modifier，其作用为：忽略 null 和空对象，然后将捕获到的值加入到结果的对应字段中。

- `!forceAdd` 的作用和 `!add` 一样，但不会忽略 null 和空对象。当我们使用赋值语法时，`!forceAdd` 会作为默认 modifier。

- `!array` 的作用是将值收集一个数组中，具体用法见[该例子](https://temme.js.org?example=modifier-array)。

- `!candidate` 与 `!add` 类似，但 `!candidate` 只会在已存在值对应布尔假（即 `Boolean(oldValue) === false`）时才执行写入操作。具体用法见[该例子](https://temme.js.org?example=modifier-candidate)。

- `!spread` 用于将来自子选择器的捕获结果合并到上层结果中。具体用法见[该例子](https://temme.js.org?example=modifier-spread)。

## 使用自定义的 modifier

和过滤器类似，temme 允许多种方式来自定义 modifier。当自定义 modifier 被调用时，参数依次为：捕获结果对象，当前捕获中声明的字段，当前捕获到的值，以及选择器中 modifier 的参数。在实现自定义的 modifier 之前，可以参考[内置 modifier 的实现](/packages/temme/src/modifiers.ts)。

### 定义全局 modifier

```JavaScript
import { defineModifier } from 'temme'

defineModifier('myModifier', function myModifier(result, key, value, ...args) {
  /* ... */
})
```

### 将 modifier 以参数的形式提供给 temme()

`temme()` 函数的**第四个**参数用于指定额外的 modifier。在下面的代码中，我们定义了一个能将字段名倒过来的 `!reverse` modifier（虽然并没有什么实际用处）。

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

### 内联定义的 modifier

在选择器字符串中直接定义 modifier。modifier 定义语法和 JavaScript 函数定义语法一样，区别在于将关键字 _function_ 换成了 _modifier_。[在线例子链接](https://temme.js.org/?example=modifier-reverse)

```javascript
modifier reverse(result, key, value) {
  /* 在这里书写 modifier 的逻辑，这里的代码将会以 JavaScript 函数的形式被执行 */
  /* 注意因为语法解析器的限制，这里的花括号必须是平衡的 */
  result.set(key.split('').reverse().join(''), value)
}

// 像下面这样使用 reverse
div{ $foo!reverse };
```

## 类 `CaptureResult`

`CaptureResult` 实例用来存储捕获的数据，在 modifier 中，我们一般调用其 set 方法来向结果中写入数据；在 procedure 中，我们一般调用其 add 方法向结果中添加值捕获。

| API                              | 作用                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `result.get(key)`                | 返回已有结果中 key 字段对应的数据                                               |
| `result.set(key, value)`         | 直接向结果的 key 字段中写入 value                                               |
| `result.add(capture, value)`     | 向结果中添加值捕获，value 会经过 filters 和 modifier 的处理，然后被写入到结果中 |
| `result.forceAdd(capture,value)` | 与 `add` 作用相同，但使用 forceAdd 作为默认的 modifier                          |
| `reuslt.getResult()`             | 返回 CaptureResult 对象中保存的所有捕获结果                                     |
