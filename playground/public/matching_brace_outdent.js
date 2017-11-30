// This file is copied from https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/matching_brace_outdent.js
define('ace/mode/matching_brace_outdent', function (require, exports) {
  'use strict'

  const Range = require('../range').Range

  exports.MatchingBraceOutdent = class MatchingBraceOutdent {
    checkOutdent(line, input) {
      if (!/^\s+$/.test(line))
        return false

      return /^\s*}/.test(input)
    }

    autoOutdent(doc, row) {
      const line = doc.getLine(row)
      let match = line.match(/^(\s*})/)

      if (!match) return 0

      const column = match[1].length
      let openBracePos = doc.findMatchingBracket({ row: row, column: column })

      if (!openBracePos || openBracePos.row === row) return 0

      const indent = this.$getIndent(doc.getLine(openBracePos.row))
      doc.replace(new Range(row, 0, row, column - 1), indent)
    }

    $getIndent(line) {
      return line.match(/^\s*/)[0]
    }
  }
})
