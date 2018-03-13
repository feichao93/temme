import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import path from 'path'

const config: webpack.Configuration = {
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
    new HtmlWebpackPlugin({
      template: 'playground/index.html',
    }),
  ],

  devServer: {
    contentBase: [
      path.resolve(__dirname, 'playground'),
      path.resolve(__dirname, 'playground/public'),
    ],
  },
}

export default config
