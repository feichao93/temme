const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const pkg = require('./package.json')

const webpackConfig = (env, argv) => {
  const prod = argv.mode === 'production'

  // const externals = {
  //   'lz-string': 'LZString',
  // }

  // if (prod) {
  //   externals.temme = 'Temme'
  // }

  return {
    context: __dirname,
    target: 'web',
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[hash:6].js',
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.styl$/,
          loaders: ['style-loader', 'css-loader', 'stylus-loader'],
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin({
        TEMME_VERSION: JSON.stringify(pkg.version),
      }),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: 'index.html',
        temmeVersion: prod ? pkg.version : null,
      }),
    ],

    devServer: {
      contentBase: [path.resolve(__dirname, 'public')],

      proxy: {
        '/api': 'http://10.214.224.234:9000',
      },
      hot: true,
    },
  }
}

module.exports = webpackConfig
