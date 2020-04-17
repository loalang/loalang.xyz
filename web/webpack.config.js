const HtmlWebpackPlugin = require("html-webpack-plugin");

const elmRule = {
  test: /\.elm$/,
  exclude: [/elm-stuff/, /node_modules/],
  use: [],
};

const config = {
  module: {
    rules: [elmRule],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};

module.exports = (env, argv) => {
  switch (argv.mode) {
    case "production":
      config.mode = "production";
      config.output = {
        filename: "[hash].js",
      };
      elmRule.use.push({
        loader: "elm-webpack-loader",
        options: { optimize: true },
      });
      break;

    case "development":
    case undefined:
      config.mode = "development";
      elmRule.use.push({
        loader: "elm-hot-webpack-loader",
        options: {},
      });
      elmRule.use.push({
        loader: "elm-webpack-loader",
        options: {},
      });
      break;

    default:
      throw new Error(`Invalid mode: ${argv.mode}`);
  }
  return config;
};
