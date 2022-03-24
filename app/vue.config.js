const { defineConfig } = require("@vue/cli-service");
// var path = require("path");

module.exports = defineConfig({
  // transpileDependencies: true,
  // publicPath: "",
  configureWebpack: {
    // No need for splitting
    optimization: {
      splitChunks: false,
    },
  },
  css: {
    extract: false,
  },
  devServer: {
    https: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    devMiddleware: {
      writeToDisk: true,
    },
  },

  // disable hashes in filenames
  filenameHashing: false,
  chainWebpack: (config) => {
    // delete HTML related webpack plugins
    config.plugins.delete("html");
    config.plugins.delete("preload");
    config.plugins.delete("prefetch");

    config.output.filename("bundle.js");

    //   // Disable the CSS extraction into a separate file.
    //   // config.module.rule("css").oneOf("vue").uses.delete("extract-css-loader");

    //   // Take the CSS from the bundle and inject it in the DOM when
    //   // the page loads...
    //   // config.module
    //   //   .rule("css")
    //   //   .oneOf("vue")
    //   //   .use("style-loader")
    //   //   .before("css-loader")
    //   //   .loader("style-loader")
    //   //   .end();
  },
});
