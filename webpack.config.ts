import {Configuration} from "webpack"
import { resolve } from 'path';
import webpack = require("webpack");

const webpackOutput = resolve(__dirname, "bin");

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
    filename: 'ltag',
    libraryTarget: 'commonjs'
  },
  externals: [],
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true })
  ],
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
