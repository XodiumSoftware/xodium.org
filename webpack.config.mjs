import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: path.resolve(__dirname, "src/assets/ts/xodium.index.ts"),
  devServer: {
    static: path.resolve(__dirname, "src"),
    compress: true,
  },
  output: {
    filename: "[name].bundle.mjs",
    path: path.resolve(__dirname, "src/export"),
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
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production",
};
