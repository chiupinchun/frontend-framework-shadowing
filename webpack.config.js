const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  // entry: './src/main.ts',
  entry: './src/create-app/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader','css-loader']
      },
      {
        test: /\.less$/i,
        use: ['style-loader','css-loader','less-loader']
      },
      {
        test: /\.(jpg|png|gif)$/i,
        type: 'asset'
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new HtmlWebpackPlugin({
    template: './public/index.html'
  })]
};