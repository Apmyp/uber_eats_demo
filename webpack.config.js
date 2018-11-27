const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const devMode = process.env.NODE_ENV !== "production";

const isDirectory = source => fs.lstatSync(source).isDirectory();
const source = path.resolve(__dirname, "src", "pages");
const pages = fs.readdirSync(source)
  .map(name => path.join(source, name))
  .filter(isDirectory)
  .map(dir => path.basename(dir));

module.exports = {
  entry: "./src/index.js",
  devtool: devMode ? "inline-source-map" : false,
  devServer: {
    contentBase: "./dist"
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ["pug-loader"]
      },
      {
        test: /\.p?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          "postcss-loader"
        ]
      },
      {
        test: /\.(png|jpg|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              outputPath: "images/"
            }
          },
          {
            loader: "img-loader",
            options: {
              plugins: [
                require("imagemin-mozjpeg")({
                  progressive: true,
                  arithmetic: false
                }),
                require("imagemin-pngquant")({
                  floyd: 0.5,
                  speed: 2
                }),
                require("imagemin-svgo")({
                  plugins: [
                    { removeTitle: true },
                    { convertPathData: false }
                  ]
                })
              ]
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: devMode
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    ...pages.map(page => new HtmlWebpackPlugin({
      filename: `${page}.html`,
      template: `src/pages/${page}/${page}.pug`,
    })),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash].css"
    })
  ],
  output: {
    filename: "bundle.[hash].js",
    path: path.resolve(__dirname, "dist")
  }
};
