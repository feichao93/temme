const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const pkg = require('./package.json')

const config = (_env, argv) => {
  const prod = argv.mode === 'production'

  const externals = {
    'lz-string': 'LZString',
  }

  return {
    context: __dirname,
    target: 'web',
    entry: path.resolve(__dirname, 'src/main.tsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: prod ? 'bundle.[chunkhash:6].js' : 'bundle.js',
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
      !prod && new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        TEMME_VERSION: JSON.stringify(pkg.version),
      }),
      new HtmlWebpackPlugin({
        template: 'index.html',
      }),
    ],

    devServer: {
      hot: true,
      contentBase: [path.resolve(__dirname, 'public')],
    },
  }
}

module.exports = config
