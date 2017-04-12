export class Scraps {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'PDF Viewer'], name: 'PDFViewer', moduleId: 'pages/myscraps/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: 'account', name: 'account', moduleId: 'pages/myscraps/account', nav: true, title: 'Account' },
            { route: 'emails', name: 'emails', moduleId: 'pages/myscraps/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/myscraps/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }
}
