module.exports = {
  configureWebpack: {
    devtool: "source-map",
  },
  devServer: {
    port: 5055,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  publicPath: "//localhost:5055/",
};
