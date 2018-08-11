const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const pkg = require('./package.json')

const config = {
  context: __dirname,
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[chunkhash:6].js',
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  module: {
    rules: [
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  externals: {
    'lz-string': 'LZString',
    // temme: 'Temme', // NOTE production build 的时候请添加该行代码
  },

  plugins: [
    new webpack.DefinePlugin({
      TEMME_VERSION: JSON.stringify(pkg.version),
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],

  devServer: {
    contentBase: [path.resolve(__dirname, 'public')],
  },
}

module.exports = config
