import { shareAll, withModuleFederationPlugin } from '@angular-architects/module-federation/webpack';

export default withModuleFederationPlugin({

  name: 'DITT',
  // Host has no remotes defined at build time
  // They are loaded dynamically at runtime  
  remotes: {},
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
