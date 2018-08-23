const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const pkg = require('./package.json')

const config = (env = {}) => {
  const externals = {
    'lz-string': 'LZString',
  }

  if (env.prod) {
    externals.temme = 'Temme'
  }

  return {
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

    externals,

    plugins: [
      new webpack.DefinePlugin({
        TEMME_VERSION: JSON.stringify(pkg.version),
      }),
      new HtmlWebpackPlugin({
        template: 'index.html',
        temmeVersion: env.prod ? pkg.version : null,
      }),
    ],

    devServer: {
      contentBase: [path.resolve(__dirname, 'public')],
    },
  }
}

module.exports = config
