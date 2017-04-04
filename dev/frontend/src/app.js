export class App {
    configureRouter(config, router) {
        config.title = 'MVP';
        config.map([
            { route: ['', 'PdfViewer'], name: 'Pdf Viewer', moduleId: './PdfViewer', nav: true, title: 'PdfViewer'},
            //{ route: 'PageOne', name: 'PageOne', moduleId: './PageOne', nav: true, title: 'PageOne'},
            { route: 'mybooks', name: 'mybooks', moduleId: './pages/mybooks', nav: true, title: 'My Books'},
            { route: 'mychapters', name: 'mychapters', moduleId: './pages/mychapters', nav: true, title: 'My Chapters'},
            { route: 'myscraps', name: 'myscraps', moduleId: './pages/myscraps', nav: true, title: 'My Scraps'},
            { route: 'profile', name: 'profile', moduleId: './pages/profile', nav: true, title: 'Profile'},
            { route: 'settings', name: 'settings', moduleId: './pages/settings', nav: true, title: 'Settings'}
        ]);

        this.router = router;
    }
}
