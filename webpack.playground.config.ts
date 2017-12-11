const MinifyPlugin = require('babel-minify-webpack-plugin')
import * as webpack from 'webpack'
import * as path from 'path'

const config: (env: any) => webpack.Configuration = (env: any) => ({
  context: __dirname,
  entry: './playground/index.js',
  devtool: false,
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
  ].concat((env && env.production) ? [
    new MinifyPlugin(),
  ] : []),

  devServer: {
    contentBase: [
      path.resolve(__dirname, 'playground'),
      path.resolve(__dirname, 'playground/public'),
    ],
  },
})

export default config
