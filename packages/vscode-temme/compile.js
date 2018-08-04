const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const mkdirp = require('mkdirp')

const content = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, 'temme.tmLanguage.yaml'), 'utf8'),
)

mkdirp.sync(path.resolve(__dirname, 'dist'))

fs.writeFileSync(
  path.resolve(__dirname, 'dist/temme.tmLanguage.json'),
  JSON.stringify(content, null, 2),
  'utf8',
)
