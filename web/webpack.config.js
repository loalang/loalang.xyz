const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  module: {
    rules: [{
      test: /\.elm$/,
      exclude: [/elm-stuff/, /node_modules/],
      use: {
        loader: "elm-webpack-loader",
        options: {},
      },
    }],
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
      break;
    case "development":
    case undefined:
      config.mode = "development";
      break;
    default:
      throw new Error(`Invalid mode: ${argv.mode}`);
  }
  return config;
};
