const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const TerserJSPlugin = require('terser-webpack-plugin')

const devMode = process.env.NODE_ENV !== 'production'
const pkg = require('../package.json')

const config = {
  mode: devMode ? 'development' : 'production',
  entry: ['./src/index.ts'],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: devMode ? 'canvas-renderer.js' : 'canvas-renderer.min.js',
    globalObject: 'this',
    library: 'canvas-renderer',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, './tsconfig.json')
        }
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {}
  },
  plugins: [
    new webpack.BannerPlugin(
      `\ncanvas-renderer v${pkg.version} \n\n${pkg.description} \n\n${fs.readFileSync(path.join(process.cwd(), 'LICENSE'))}`
    ),
  ],
  optimization: {
    minimizer: devMode
      ? []
      : [
          // 压缩 js 代码，但保留注释（例如头部 Banner、JSDoc 等）
          // webpack v5 使用内置的 TerserJSPlugin 替代 UglifyJsPlugin，因为 UglifyJsPlugin 不支持 ES6
          new TerserJSPlugin({
            parallel: true, // 使用多进程并行运行
            extractComments: false, // 不额外抽取到 .LICENSE.txt 文件，直接保留在 bundle 中
            terserOptions: {
              format: {
                comments: 'all', // 保留所有注释，如果只想保留以 /*! 开头的，可以改为 'some'
              },
            },
          }),
        ]
  }
}

module.exports = config