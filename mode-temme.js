'use strict'
define('ace/mode/temme', function (require, exports) {
  const TextMode = require('./text').Mode
  const TextHighlightRules = require('./text_highlight_rules').TextHighlightRules
  const Behaviour = require('./behaviour').Behaviour
  const MatchingBraceOutdent = require('./matching_brace_outdent').MatchingBraceOutdent

  const identifierReg = '[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*'

  function filters(next) {
    return [
      {
        // filter with args
        token: ['text', 'entity.name.function', 'paren.lparen'],
        regex: `(\\||\\|\\|)(${identifierReg})(\\()`,
        push: 'argsState',
      },
      {
        // filter without args
        token: ['text', 'entity.name.function'],
        regex: `(\\||\\|\\|)(${identifierReg})`,
      },
      {
        regex: '',
        next: next || 'pop',
      },
    ]
  }

  function comments(next) {
    return [
      {
        token: 'comment', // multi line comment
        regex: /\/\*/,
        next: [
          { token: 'comment', regex: '\\*\\/', next: next || 'pop' },
          { defaultToken: 'comment', caseInsensitive: true },
        ]
      }, {
        token: 'comment',
        regex: '\\/\\/',
        next: [
          { token: 'comment', regex: '$|^', next: next || 'pop' },
          { defaultToken: 'comment', caseInsensitive: true },
        ]
      }
    ];
  }

  class TemmeHighlightRules extends TextHighlightRules {
    constructor() {
      super()

      this.$rules = {
        regex: [
          {
            // escapes
            token: 'regexp.keyword.operator',
            regex: '\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)'
          },
          {
            // flag
            token: 'string.regexp',
            regex: '/[sxngimy]*',
            next: 'pop'
          },
          {
            // invalid operators
            token: 'invalid',
            regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/
          },
          {
            // operators
            token: 'constant.language.escape',
            regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/
          },
          {
            token: 'constant.language.delimiter',
            regex: /\|/
          },
          {
            token: 'constant.language.escape',
            regex: /\[\^?/,
            push: 'regex_character_class',
          },
          {
            token: 'empty',
            regex: '$',
            next: 'pop'
          },
          {
            defaultToken: 'string.regexp'
          }
        ],
        regex_character_class: [
          {
            token: 'regexp.charclass.keyword.operator',
            regex: '\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)'
          },
          {
            token: 'constant.language.escape',
            regex: ']',
            next: 'pop'
          },
          {
            token: 'constant.language.escape',
            regex: '-'
          },
          {
            token: 'empty',
            regex: '$',
            next: 'pop'
          },
          {
            defaultToken: 'string.regexp.charachterclass'
          }
        ],
        jsLiteralState: [
          {
            token: 'string.start',
            regex: "'",
            push: [
              {
                token: 'string.end',
                regex: "'|$",
                next: 'pop'
              },
              {
                include: 'escapes'
              },
              {
                token: 'constant.language.escape',
                regex: /\\$/,
                consumeLineEnd: true
              },
              {
                defaultToken: 'string'
              },
            ],
          },
          {
            token: 'string.start',
            regex: '"',
            push: [
              {
                token: 'string.end',
                regex: '"|$',
                next: 'pop'
              },
              {
                include: 'escapes'
              },
              {
                token: 'constant.language.escape',
                regex: /\\$/,
                consumeLineEnd: true
              },
              {
                defaultToken: 'string'
              }
            ]
          },
          {
            token: 'constant.numeric', // hexadecimal, octal and binary
            regex: /0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/
          },
          {
            token: 'constant.numeric', // decimal integers and floats
            regex: /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/
          },
          {
            token: 'constant.language',
            regex: 'null|false|true',
          },
          {
            token: 'string.regexp',
            regex: '\\/',
            push: 'regex',
          },
        ],

        start: [
          comments('start'),
          {
            token: 'keyword',
            regex: '#[a-z0-9-_]+',
          },
          {
            token: 'keyword',
            regex: '&',
          },
          {
            token: 'variable',
            regex: '\\.[a-z0-9-_]+'
          },
          {
            token: 'string',
            regex: ':[a-z0-9-_]+'
          },
          {
            // inline filter definiton
            token: ['storage.type', 'text', 'entity.name.function'],
            regex: `(filter)(\\s+)(${identifierReg})`,
            push: [
              {
                token: 'paren.lparen',
                regex: '\\(',
                next: 'argsState',
              },
            ],
          },
          {
            token: 'constant',
            regex: '[a-z0-9-_]+'
          },
          {
            token: 'paren.lparen',
            regex: '\\{',
            push: 'contentState',
          },
          {
            token: 'paren.rparen',
            regex: '\\}',
            next: 'pop',
          },
          {
            token: 'paren.lparen',
            regex: '\\[',
            push: 'attrState',
          },
          {
            token: ['variable.parameter'],
            regex: `\\$(?:${identifierReg})?`,
            push: filters(),
          },
          {
            // snippet definition
            token: ['keyword', 'text', 'keyword.operator'],
            regex: `(@(?:${identifierReg})?)(\\s*)(=)`,
            push: filters('beforeChildrenSelectorState'),
          },
          {
            // snippet expansion
            token: ['keyword', 'text'],
            regex: `(@(?:${identifierReg})?)(\\s*;)`,
          },
          {
            // children selectors
            token: 'variable.parameter',
            regex: `@(?:${identifierReg})?`,
            push: filters('beforeChildrenSelectorState'),
          },
          {
            caseInsensitive: true
          },
        ],

        beforeChildrenSelectorState: [
          comments('beforeChildrenSelectorState'),
          {
            token: 'paren.lparen',
            regex: '\\{',
            next: 'start',
          },
        ],

        attrState: [
          comments('attrState'),
          {
            token: 'variable.parameter',
            regex: `\\$(?:${identifierReg})?`,
            push: filters(),
          },
          {
            token: 'constant',
            regex: identifierReg,
          },
          {
            token: 'keyword.operator',
            regex: /=|~=|\|=|\*=|\^=|\$=/,
          },
          {
            token: 'paren.rparen',
            regex: ']',
            next: 'pop',
          },
        ],

        contentState: [
          comments('contentState'),
          { include: 'jsLiteralState' },
          {
            // capture in content or the leftside of the assignment
            token: 'variable.parameter',
            regex: `\\$(?:${identifierReg})?`,
            push: filters(),
          },
          {
            // content function call
            token: ['entity.name.function', 'text', 'paren.lparen'],
            regex: '(' + identifierReg + ')(\\s*)(\\()',
            push: 'argsState'
          },
          {
            token: ['keyword.operator'],
            regex: '=',
          },
          {
            token: 'paren.rparen',
            regex: '\\}',
            next: 'pop',
          },
          { defaultToken: 'text' },
        ],

        argsState: [
          comments('argsState'),
          { include: 'jsLiteralState' },
          {
            token: 'variable.parameter',
            regex: `\\$(?:${identifierReg})?`,
            push: filters(),
          },
          {
            token: 'punctuation.operator',
            regex: '[, ]+'
          },
          {
            token: 'paren.rparen',
            regex: '\\)',
            next: 'pop',
          },
        ],

        escapes: [
          {
            token: 'constant.language.escape',
            regex: /\\([a-fA-F\d]{1,6}|[^a-fA-F\d])/
          },
        ]
      }

      this.normalizeRules()
    }
  }

  class Mode extends TextMode {
    constructor() {
      super()
      this.HighlightRules = TemmeHighlightRules
      this.$behaviour = new Behaviour()
      this.$outdent = new MatchingBraceOutdent()
    }

    getNextLineIndent(state, line, tab) {
      let indent = this.$getIndent(line)
      if (line.match(/^.*\{\s*$/)) {
        indent += tab
      }
      return indent
    }

    autoOutdent(state, doc, row) {
      this.$outdent.autoOutdent(doc, row)
    }

    checkOutdent(state, line, input) {
      return this.$outdent.checkOutdent(line, input)
    }
  }

  Mode.prototype.type = 'temme'

  exports.TemmeHighlightRules = TemmeHighlightRules
  exports.Mode = Mode
})
