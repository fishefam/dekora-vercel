const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // Works with React 19 + Next
            presets: ["next/babel"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      // Optional: images/fonts if your components import them
      { test: /\.(png|jpe?g|gif|svg|woff2?)$/i, type: "asset" },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      // if you use "@/..." imports
      "@": path.resolve(__dirname, "src"),
    },
  },
};
