import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: path.resolve(__dirname, "src/assets/ts/xodium.index.ts"),
  devServer: {
    static: path.resolve(__dirname, "src"),
    compress: true,
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "src/assets/js"),
  },
  optimization: {
    runtimeChunk: false,
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
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  mode: "development",
};
