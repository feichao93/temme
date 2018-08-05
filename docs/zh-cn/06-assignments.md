## 赋值

#### 语法

- `$foo = bar;` foo 是一个合法 JavaScript 标识符；bar 是一个 JavaScript 字面量；目前 temme 支持的字面量包括 string, number, null, boolean, RegExp。

#### 运行时行为

赋值的含义取决于该语法结构所在的上下文：

- 在顶层中，`$foo = 'bar';` 表示将字符串 bar 放到最终结果的 foo 字段
- 在 content 中，`div.foo{ $a = null }` 像是一个条件赋值，如果有一个元素满足选择器 `div.foo`，那么就执行该赋值操作；
- 在数组匹配的子选择器中，`li@list { $x = 123 }` 意味着数组匹配结果中每个数组元素的 x 字段的值都为数字 `123`。

#### 例子

```JavaScript
// html和前面的数组捕获中的一样
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
