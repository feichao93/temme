const fs = require('fs')
const yaml = require('js-yaml')
const content = yaml.safeLoad(fs.readFileSync('temme.tmLanguage.yaml', 'utf8'))

fs.writeFileSync(
  'output/temme.tmLanguage.json',
  JSON.stringify(content, null, 2),
  'utf8',
)