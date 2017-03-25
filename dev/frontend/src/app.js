export class App {
    configureRouter(config, router) {
        config.title = 'MVP';
        config.map([
            { route: ['', 'PdfViewer'], name: 'PdfViewer', moduleId: './PdfViewer', nav: true, title: 'PdfViewer'},
            { route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'PageOne'},
            { route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'My Books'},
            { route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'My Chapters'},
            { route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'My Scraps'},
            { route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'Profile'},
            { route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'Settings'}
        ]);

        this.router = router;
    }
}