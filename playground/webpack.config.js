const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../docs'),
  },

  context: __dirname,
  target: 'web',
  devServer: {
    contentBase: path.resolve(__dirname, 'src'),
  },
}
