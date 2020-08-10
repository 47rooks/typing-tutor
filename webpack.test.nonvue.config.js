// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './tests/mocha/database/TypingDb.spec.ts',
  devServer: {
    contentBase: './nonvue-build',
    watchContentBase: true,
  },
  devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.test.nonvue.json',
        },
      },
    ],
  },
  output: {
    filename: 'testbundle.js',
    path: path.resolve(__dirname, 'nonvue-build'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Mocha Non-Vue Tests',
      template: 'tests/mocha/database/TypingDbSpecTemplate.html',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
