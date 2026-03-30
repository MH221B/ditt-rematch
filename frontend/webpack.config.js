const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack.js');

module.exports = withModuleFederationPlugin({

  name: 'DITT',
  // Host has no remotes defined at build time
  // They are loaded dynamically at runtime  
  remotes: {},
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
