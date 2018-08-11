const webpack = require('webpack')
const path = require('path')

const pkg = require('./package.json')

const config = {
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'temme.umd.js',
    library: 'Temme',
    libraryTarget: 'umd',
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
        options: {
          transpileOnly: true,
        },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      TEMME_VERSION: JSON.stringify(pkg.version),
    }),
  ],
}

module.exports = config
