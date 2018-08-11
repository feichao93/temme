#!/usr/bin/env node
const program = require('commander')
const temme = require('..').default
const fs = require('fs')
const pkg = require('../package.json')

program
  .version(pkg.version)
  .usage('[options] [selector] [html]')
  .option('-f, --format', 'output formatted JSON')
  .parse(process.argv)

let [selector, html] = program.args

if (fs.existsSync(selector)) {
  selector = fs.readFileSync(selector, 'utf8')
}

function outputResult(result) {
  if (program.format) {
    process.stdout.write(JSON.stringify(result, null, 2))
  } else {
    process.stdout.write(JSON.stringify(result))
  }
}

if (selector == null) {
  throw new Error('No temme selector specified.')
}

if (html != null && html !== '-') {
  if (fs.existsSync(html)) {
    html = fs.readFileSync(html, 'utf8')
  }
  outputResult(temme(html, selector))
  process.exit(0)
} else {
  // read html from stdin
  html = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    let chunk
    while ((chunk = process.stdin.read())) {
      html += chunk
    }
  })

  process.stdin.on('end', () => {
    outputResult(temme(html, selector))
    process.exit(0)
  })
}
