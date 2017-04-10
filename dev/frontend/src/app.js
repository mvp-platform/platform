export class App {
    configureRouter(config, router) {
        config.title = 'MVP';
        config.map([
            { route: '', redirect: 'mybooks' },
            { route: 'mybooks', name: 'mybooks', moduleId: './pages/mybooks/mybooks', nav: true, title: 'My Books' },
            { route: 'mychapters', name: 'mychapters', moduleId: './pages/mychapters/mychapters', nav: true, title: 'My Chapters' },
            { route: 'myscraps', name: 'myscraps', moduleId: './pages/myscraps/myscraps', nav: true, title: 'My Scraps' },
            { route: 'profile', name: 'profile', moduleId: './pages/profile', nav: true, title: 'Profile' },
            { route: 'settings', name: 'settings', moduleId: './pages/settings', nav: true, title: 'Settings' }
        ]);

        this.router = router;
    }
}
