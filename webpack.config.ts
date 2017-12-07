import * as webpack from 'webpack'
import * as path from 'path'

const config: webpack.Configuration = {
  context: __dirname,
  entry: './src/index.ts',
  devtool: false,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
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
  ],
  externals: ['cheerio', 'pegjs'],
}

export default config
