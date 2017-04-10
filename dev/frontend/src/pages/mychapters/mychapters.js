export class Chapters {
    constructor() { }
    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
            { route: ['', 'PDF Viewer'], name: 'PDFViewer', moduleId: 'pages/mychapters/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: 'account', name: 'account', moduleId: 'pages/mychapters/account', nav: true, title: 'Account' },
            { route: 'emails', name: 'emails', moduleId: 'pages/mychapters/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/mychapters/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }
}
