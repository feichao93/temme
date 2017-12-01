#!/usr/bin/env node
const program = require('commander')
const temme = require('..').default
const fs = require('fs')

program
  .usage('[options] [selector] [html]')
  .option('-f, --file <path>', 'use a selector file')
  .option('--format', 'output formated JSON')
  .parse(process.argv)

let [selector, html] = program.args

if (program.file) {
  html = selector
  selector = fs.readFileSync(program.file, 'utf8')
}

function outputResult(result) {
  if (program.format) {
    process.stdout.write(console.log(JSON.stringify(result, null, 2)))
  } else {
    process.stdout.write(JSON.stringify(result))
  }
}

if (selector == null) {
  throw new Error('No temme selector specified.')
}

if (html != null) {
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
