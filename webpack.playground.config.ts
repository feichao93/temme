import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import path from 'path'
const packageInfo = require('./package.json')

const config: webpack.Configuration = {
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
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      WEBPACK_BUILD: JSON.stringify(true),
      TEMME_VERSION: JSON.stringify(packageInfo.version),
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
