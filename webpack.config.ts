const MinifyPlugin = require('babel-minify-webpack-plugin')
import * as webpack from 'webpack'
import * as path from 'path'

const config: webpack.Configuration = {
  context: __dirname,
  entry: './src/temme.ts',
  devtool: false,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'temme.js',
    library: 'temme',
    libraryTarget: 'umd',
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  module: {
    rules: [
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      WEBPACK_BUILD: JSON.stringify(true),
    }),
    new MinifyPlugin(),
  ],
  externals: ['cheerio', 'pegjs'],
}

export default config
