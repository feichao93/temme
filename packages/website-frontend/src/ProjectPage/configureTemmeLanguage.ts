import * as monaco from 'monaco-editor'

monaco.languages.register({
  id: 'temme',
  extensions: ['.css'],
  aliases: ['Temme', 'temme'],
  mimetypes: ['text/temme'],
})

// TODO monaco.languages.setLanguageConfiguration('temme', ...)
// todo 给 temme 添加一个自定义的主题
// TODO 去掉以 test- 开头的测试用的 token-class

monaco.languages.setMonarchTokensProvider('temme', {
  defaultToken: process.env.NODE_ENV === 'production' ? '' : 'invalid',
  tokenPostfix: '.temme',
  brackets: [
    { open: '{', close: '}', token: 'delimiter.curly' },
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
  ],

  // @ts-ignore
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  cssIdentifier: /-?-?([a-zA-Z]|(\\(([0-9a-fA-F]{1,6}\s?)|[^[0-9a-fA-F])))([\w\-]|(\\(([0-9a-fA-F]{1,6}\s?)|[^[0-9a-fA-F])))*/,
  jsIdStart: /[_$a-zA-Z]/,
  jsIdChar: /[_$a-zA-Z0-9]/,

  tokenizer: {
    root: [{ include: '@inlineDefinition' }, { include: '@temmeSelector' }],

    temmeSelector: [
      { include: '@whitespace' },
      { include: '@JSLiteral' },
      [/}/, { token: '@rematch', next: '@pop' }],

      // CSS selector
      [/(\.|#(?=[^{])|%|(@cssIdentifier)|:)+/, 'tag'],
      // CSS 选择器 combinator 以及分号
      [/([>+~;])/, 'delimiter'],

      // Stylus-like 父元素引用
      [/&/, 'number'], // 这里用 number 是为了显示不一样的颜色

      [/=/, 'operator', '@assignment'],

      [/\[/, '@rematch', '@attributeWrapper'],
      [/(\$(@jsIdStart@jsIdChar*)?)/, 'type', '@filters'],
      // snippet expansion
      [/(@@jsIdStart@jsIdChar*)\s*;/, 'variable.test-snippet-expansion'],

      // snippet definition
      // @ts-ignore
      [
        /(@@jsIdStart@jsIdChar*)(\s*)(=)/,
        [
          'variable.test-snippet-definition',
          'white',
          { token: 'operator.test-snippet-definition', next: '@snippetDefineWrapper' },
        ],
      ],

      // children-selectors
      [/@(@jsIdStart@jsIdChar*)?/, 'type.test-array-capture-name', '@clause1'],

      [/{/, { token: '@rematch', next: '@procedureWrapper' }],
    ],

    assignment: [{ include: '@whitespace' }, { include: '@JSLiteral' }, [/;/, 'delimiter', '@pop']],

    procedureWrapper: [
      [/{/, 'delimiter.test-procedure-start', '@procedure'],
      [/}/, 'delimiter.test-procedure-end', '@pop'],
    ],

    procedure: [
      { include: '@whitespace' },
      { include: '@JSLiteral' },
      [/}/, '@rematch', '@pop'],
      [/=/, 'operators'],
      [/\$(@jsIdStart@jsIdChar*)?/, 'type', '@filters'],
      // @ts-ignore
      [
        /(@jsIdStart@jsIdChar*)(\s*)(\()/,
        ['variable', 'white', { token: '@rematch', next: '@parametersWrapper' }],
      ],
    ],

    snippetDefineWrapper: [
      [/{/, { token: 'delimiter.snippetDefineStart', bracket: '@open', next: '@temmeSelector' }],
      [/}/, { token: 'delimiter.snippetDefineStart', bracket: '@close', next: '@pop' }],
    ],

    // after xxx@name
    clause1: [
      [/\|/, { token: '@rematch', next: '@filters' }],
      [/{/, { token: '@rematch', switchTo: '@childrenSelector' }],
    ],

    childrenSelector: [
      [/{/, { token: 'delimiter.children-selector-start', next: '@temmeSelector' }],
      [/}/, { token: 'delimiter.children-selector-end', next: '@pop' }],
    ],

    attributeWrapper: [
      [/\[/, { token: 'delimiter', bracket: '@open', next: '@attribute' }],
      [/]/, { token: 'delimiter', bracket: '@close', next: '@pop' }],
    ],

    attribute: [
      { include: '@whitespace' },
      { include: '@JSString' },
      [/]/, '@rematch', '@pop'],
      [/\||\|\||!/, '@rematch', '@filters'],
      [/\$(@jsIdStart@jsIdChar*)?/, 'type'],
      [/=|~=|\|=|\*=|\^=|\$=/, 'operators'],
      [/@cssIdentifier/, 'attribute.value'],
    ],

    // filter state 包含了 filter 和 modifier 两部分的此法高亮
    filters: [
      [/(?![|!])/, 'operator', '@pop'],
      // filter/modifier with parameters
      // @ts-ignore
      [
        /(\||\|\||!)(@jsIdStart@jsIdChar*)(\()/,
        ['operator', 'entity', { token: '@rematch', next: 'parametersWrapper' }],
      ],
      // filter/modifier without parameters
      [/(\||\|\||!)(@jsIdStart@jsIdChar*)/, ['operator', 'entity']],
    ],

    parametersWrapper: [[/\(/, 'delimiter', '@parameters'], [/\)/, 'delimiter', '@pop']],

    parameters: [
      { include: '@whitespace' },
      { include: '@JSLiteral' },
      [/\)/, { token: '@rematch', next: '@pop' }],
      [/\$(@jsIdStart@jsIdChar*)?/, 'type', '@filters'],
      [/@jsIdStart@jsIdChar*/, 'identifier'],
      [/[, ]+/, 'delimiter'],
    ],

    comment: [[/[^\/*]+/, 'comment'], [/\*\//, 'comment', '@pop'], [/[\/*]/, 'comment']],

    whitespace: [[/[ \t\r\n]+/, 'white'], [/\/\*/, 'comment', '@comment'], [/\/\/.*$/, 'comment']],

    JSLiteral: [
      [/null|false|true/, 'constant.language'],
      { include: '@JSString' },
      { include: '@JSNumeric' },
      { include: '@JSRegex' },
    ],

    JSString: [
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
      [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-terminated string
      [/"/, 'string', '@JSStringDouble'],
      [/'/, 'string', '@JSStringSingle'],
      // temme 暂时不支持反引号字符串
    ],

    JSStringDouble: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop'],
    ],

    JSStringSingle: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop'],
    ],

    JSNumeric: [
      // hexadecimal, octal and binary
      [/0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/, 'number'],
      // decimal integers and floats
      [/(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/, 'number'],
    ],

    JSRegex: [[/\/(?!=\/)/, 'delimiter', '@JSRegexBody']],
    JSRegexBody: [
      // @ts-ignore
      [/(\/)([gimsuy]*)/, ['delimiter', { token: 'keyword', next: '@pop' }]],
      [/[^/]/, 'regexp'],
    ],

    inlineDefinition: [
      // @ts-ignore
      [
        /(filter|modifier|procedure)(\s+)(@jsIdStart@jsIdChar*)/,
        ['keyword', 'white', { token: 'identifier', next: 'inlineDefinitionParametersWrapper' }],
      ],
    ],
    inlineDefinitionParametersWrapper: [
      [/\(/, { token: 'delimiter', bracket: '@open', next: '@parameters' }],
      [/\)/, { token: 'delimiter', bracket: '@close', switchTo: '@inlineDefinitionBody' }],
    ],
    inlineDefinitionBody: [
      [/{/, { token: 'delimiter', switchTo: '@curlyBlock' }],
      [/}/, 'delimiter', '@pop'],
    ],
    // TODO 需要集成 javascript 的高亮规则
    curlyBlock: [
      [/[^{}]+/, 'javascript-todo'],
      [/{/, 'delimiter', '@curlyBlock'],
      [/}/, 'delimiter', '@pop'],
    ],
  },
})
