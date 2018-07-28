const packageInfo = require('./package.json')

module.exports = {
  globals: {
    TEMME_VERSION: packageInfo.version,
  },
  transform: {
    '^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(tsx?|jsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],
  collectCoverage: true,
}
