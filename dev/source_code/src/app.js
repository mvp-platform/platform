export class App {
    configureRouter(config, router) {
        config.title = 'Aurelia';
        config.map([
            { route: ['', 'PdfViewer'], name: 'PdfViewer', moduleId: './PdfViewer', nav: true, title: 'PdfViewer'},
            { route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'PageOne'}
        ]);

        this.router = router;
    }
}