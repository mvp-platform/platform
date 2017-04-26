export function configure(aurelia) {

 let materialize = 'materialize-css';

  return aurelia.loader.loadModule(materialize).then(() => {
    aurelia.use
    .standardConfiguration()
    .developmentLogging()
    // Install and configure the plugin
    .plugin('aurelia-dragula')
    .plugin('aurelia-materialize-bridge', bridge => bridge.useAll());
    return aurelia.start().then(a => a.setRoot());
  });
}
