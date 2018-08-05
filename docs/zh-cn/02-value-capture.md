## 值捕获 `#`

#### 语法

- `[foo=$xxx]` 放在特性匹配部分，来捕获该特性的值；
- `{$xxx}` 放在内容部分来捕获元素的 HTML 或文本内容；
- `[foo=$]` / `{$}` 省略 xxx，以进行「默认值捕获」。

值捕获是捕获的基本方式。把值捕获放在特性部分（也就是方括号内）用于捕获特性的值；也可以放在内容部分（花括号内）用于捕获节点的 HTML 或文本。

#### 运行时行为

CSS 选择器中，特性匹配的语法是这样的：`[foo=bar]`；而特性捕获的语法是这样的：`[foo=$bar]`。该捕获语法的含义：将特性 `foo` 的值放到结果的 `.bar` 字段中。内容捕获 `{$buzz}` 表示：将节点的文本内容放到结果的 `.buzz` 字段中。

`temme()` 的输出是一个对象, 叫做捕获结果。捕获结果在特定的字段中包含了捕获的元素。我们可以使用一个 `$` 符号来进行默认值捕获, 此时捕获结果将会为单个值。

#### 例子

```JavaScript
temme('<div class="red">text content</div>', 'div[class=$cls]{$content};')
//=> { cls: 'red', content: 'text content' }

temme('<div class="red">text content</div>', 'div[class=$]')
//=> 'red'
```
