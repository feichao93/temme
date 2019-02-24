## Temme and JavaScript

Temme is implemented in JavaScript, so it borrows some features from JavaScript in grammar.

### Comments

Temme selector supports both single line comments `// ......` and block comments `/* ...... */` as in JavaScript.

### Simple JavaScript Literals

Temme supports parsing some simple JavaScript literals, including string, number, null, boolean and RegExp. Note these literals are only allowed in specific grammar constructs, please see other part of the documentation.

### Filter and JavaScript function

Temme supports filters from [prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) out of the box, so we can do simple data conversion easily. Inline filters/modifiers/procedures have a very similiar definition syntax with JavaScript functions, which reduces the learning cost of temme for JavaScript developers.
