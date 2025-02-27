const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        //target: "http://boong-vpc-ec2-deploy-lb-999176414.ap-northeast-2.elb.amazonaws.com:80/",
        target: "http://localhost:1024/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
      "/oauth2.0": {
        target: "https://nid.naver.com/",
        changeOrigin: true,
        logLevel: "debug",
      },
      "/v1": {
        target: "https://openapi.naver.com/",
        changeOrigin: true,
        logLevel: "debug",
      },
    },
  },
});
