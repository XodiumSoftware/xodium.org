const path = require("path");

module.exports = {
  entry: "./src/assets/ts/xodium.index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "src/assets/js"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  mode: "development",
};
