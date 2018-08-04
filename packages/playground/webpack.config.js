import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import path from 'path'
const pkg = require('./package.json')

const config = {
  context: __dirname,
  entry: './playground/index.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'playground-build'),
    filename: '[chunkhash].bundle.js',
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

  plugins: [
    new webpack.DefinePlugin({
      WEBPACK_BUILD: JSON.stringify(true),
      TEMME_VERSION: JSON.stringify(pkg.version),
    }),
    new HtmlWebpackPlugin({
      template: 'playground/index.html',
    }),
  ],

  // @ts-ignore
  devServer: {
    contentBase: [
      path.resolve(__dirname, 'playground'),
      path.resolve(__dirname, 'playground/public'),
    ],
  },
}

export default config
