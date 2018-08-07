## JavaScript

temme 使用 JavaScript/TypeScript 进行实现，语法层面也借鉴了不少 JavaScript 的特性。

### 注释

temme 支持单行注释 `// ......` 与块状注释 `/* ...... */`，与 JavaScript 保持一致。

### JavaScript 字面量

temme 支持解析一部分的 JavaScript 字面量，包括了 string, number, null, boolean, RegExp。注意这些字面量只能用在特定的语法结构中，详见文档的其他部分。

### filter 与 javascript function

temme 默认支持来自原型链的过滤器，可以方便地进行一些简单的格式转换。内联定义的过滤器和 JavaScript 函数定义的形式非常类似，以降低 JavaScript 程序员对 temme 的学习成本。因为在使用原型链过滤器的时候，捕获内容相当于放在了 `this` 中，所以在自定义中，我们通过 `this` 来存取捕获到的数据。
