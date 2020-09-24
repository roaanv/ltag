import {Configuration} from "webpack"
import { resolve } from 'path';

const webpackOutput = resolve(__dirname, "dist");

const config:Configuration = {
  mode: process.env.NODE_ENV === 'prod' ? 'production' : 'development',
  entry: {
    "ltag": resolve(__dirname, "src", "main.ts")
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  target: 'node',
  optimization: {
    minimize: false
  },
  output: {
    path: webpackOutput,
    filename: 'ltag.js',
    libraryTarget: 'commonjs'
  },
  externals: [],
  stats: 'errors-warnings',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ],
      }
    ]
  }
};

export default config;
