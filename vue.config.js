module.exports = {
  devServer: {
    proxy: {
      "/api|/v2|/saml|/oauth2|/login|/logout": {
        target: "http://dev-psvc.av.ge.com/services/submitInquiry",
        changeOrigin: true,
        logLevel: "debug" 
      }
    },
    port: 8096
  },
  transpileDependencies: [
    'vuetify'
  ]

}
