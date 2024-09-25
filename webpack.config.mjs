import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: path.resolve(__dirname, "src/assets/scripts/xodium.index.ts"),
  devServer: {
    static: path.resolve(__dirname, "src"),
    compress: true,
  },
  output: {
    filename: "[name].bundle.mjs",
    path: path.resolve(__dirname, "src/dist"),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [new BundleAnalyzerPlugin()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production",
};
