export class App {

    configureRouter(config, router) {
        config.title = 'MVP';
        config.map([
            { route: '', redirect: 'mybooks' },
            { route: 'mybooks', name: 'mybooks', moduleId: './pages/mybooks/mybooks', nav: true, title: 'My Books' },
            { route: 'editBook/:author/:uuid', name: 'editBook', moduleId: './pages/editBook/editBook', nav: false, title: 'Edit Book' },
            { route: 'mychapters', name: 'mychapters', moduleId: './pages/mychapters/mychapters', nav: true, title: 'My Chapters' },
            { route: 'editchapter/:author/:uuid', name: 'editchapter', moduleId: './pages/editchapter/editchapter', nav: false, title: 'Edit Chapter (temp)' },
            { route: 'myscraps', name: 'myscraps', moduleId: './pages/myscraps/myscraps', nav: true, title: 'My Scraps' },
            { route: 'editscrap', name: 'editscrap', moduleId: './pages/editscrap/editscrap', nav: true, title: 'Edit Scrap (temp)' },
            { route: 'profile', name: 'profile', moduleId: './pages/profile', nav: true, title: 'Profile' },
            { route: 'settings', name: 'settings', moduleId: './pages/settings', nav: true, title: 'Settings' }
        ]);

        this.router = router;
    }
}