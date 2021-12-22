let appName = 'Pikmin Bloom Decor Checklist';

module.exports = {
  // allow to be hosted anywhere
  // baseUrl: './', // old vue-cli version
  publicPath: './',
  pwa: {
    name: appName,
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxOptions: {
      skipWaiting: true
    }
  },
  pages: {
    index: {
      entry: 'src/main.js',
      title: appName
    }
  }
}
