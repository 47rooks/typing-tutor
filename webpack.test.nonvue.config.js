// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  entry: './tests/mocha/database/TypingDb.spec.ts',
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
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
