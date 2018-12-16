const HtmlWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const pkg = require('./package.json')

const webpackConfig = (env, argv) => {
  const prod = argv.mode === 'production'

  return {
    context: __dirname,
    target: 'web',
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      publicPath: '/static/',
      path: path.resolve(__dirname, 'dist/static/'),
      filename: '[name].[hash:6].js',
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
      !prod && new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.html',
      }),
      new MonacoWebpackPlugin(),
    ].filter(Boolean),

    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      historyApiFallback: true,
      proxy: {
        '/api': 'http://localhost:3000',
      },
      hot: true,
    },
  }
}

module.exports = webpackConfig
