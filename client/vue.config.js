const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/_client",
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
  },
  runtimeCompiler: true,
  css: {
    extract: false,
  },
  devServer: {
    https: true,
    // proxy: "https://localhost:8080",
    port: 35500,
    allowedHosts: "all",
    headers: { "Access-Control-Allow-Origin": "*" },
    // proxy: {
    //   "^/": {
    //     target: "http://localhost:8080",
    //     ws: true,
    //     changeOrigin: true,
    //   },
    // },
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
  },
});
