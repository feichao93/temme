const pkg = require('./package.json')

module.exports = {
  globals: {
    TEMME_VERSION: pkg.version,
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.pegjs?$': 'pegjs-jest',
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(tsx?|jsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],
  testURL: 'http://localhost',
  coveragePathIgnorePatterns: ['/node_modules/', 'grammar.pegjs'],
}
