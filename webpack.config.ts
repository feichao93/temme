import * as webpack from 'webpack'
import * as path from 'path'

const webConfig: webpack.Configuration = {
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'browser'),
    filename: 'index.js',
    library: 'Temme',
    libraryTarget: 'var',
  },
  externals: ['pegjs'],
}

const nodeConfig: webpack.Configuration = {
  target: 'node',
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    library: 'temme',
    libraryTarget: 'commonjs2',
  },
  externals: ['cheerio', 'pegjs'],
}

const baseConfig: webpack.Configuration = {
  mode: 'production',
  context: __dirname,
  entry: './src/index.ts',

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
    }),
  ],
}

export default (env: any) => {
  const result = []
  if (Boolean(env && env.node)) {
    result.push(Object.assign({}, baseConfig, nodeConfig))
  }
  if (Boolean(env && env.web)) {
    result.push(Object.assign({}, baseConfig, webConfig))
  }
  return result
}
