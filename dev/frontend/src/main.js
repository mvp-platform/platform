export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    /*.plugin('aurelia-tabbed')*/
    .developmentLogging();

  aurelia.start().then(() => aurelia.setRoot());
}
