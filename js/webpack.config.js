const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {test: /\.vue$/, loader: 'vue-loader', options: {loaders: {sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'}}},
      {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
      {test: /(\.css$)/, loaders: ['style-loader', 'css-loader']},
      {test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'file-loader'}
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  node: {
    fs: 'empty'
  },
  performance: {hints: false},
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}),
    new webpack.optimize.UglifyJsPlugin({sourceMap: true, compress: {warnings: false}}),
    new webpack.LoaderOptionsPlugin({minimize: true})
])
}
