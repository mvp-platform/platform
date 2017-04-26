import {Cookies} from 'aurelia-plugins-cookies';

let logged_in_routes = [
    { route: '', redirect: 'mybooks' },
    { route: 'mybooks', name: 'mybooks', moduleId: './pages/mybooks/mybooks', nav: true, title: 'My Books' },
    { route: 'mychapters', name: 'mychapters', moduleId: './pages/mychapters/mychapters', nav: true, title: 'My Chapters' },
    { route: 'myscraps', name: 'myscraps', moduleId: './pages/myscraps/myscraps', nav: true, title: 'My Scraps' },

    { route: 'editBook/:author/:uuid', name: 'editBook', moduleId: './pages/editBook/editBook', nav: false, title: 'Edit Book' },
    { route: 'editchapter/:author/:uuid', name: 'editchapter', moduleId: './pages/editchapter/editchapter', nav: false, title: 'Edit Chapter' },
    { route: 'editscrap', name: 'editscrap', moduleId: './pages/editscrap/editscrap', nav: false, title: 'Edit Scrap' },

    { route: 'newscrap', name: 'newscrap', moduleId: './pages/editscrap/newscrap', nav: false, title: 'New Scrap' },
    { route: 'newchapter', name: 'newchapter', moduleId: './pages/editchaper/newchapter', nav: false, title: 'New Chapter' },
    { route: 'newbook', name: 'newbook', moduleId: './pages/editbook/newbook', nav: false, title: 'New Book' },

    { route: 'profile', name: 'profile', moduleId: './pages/profile', nav: true, title: 'Profile' },
    { route: 'settings', name: 'settings', moduleId: './pages/settings', nav: true, title: 'Settings' }
];

let logged_out_routes = logged_in_routes.map(r => { return {route: r.route, redirect: 'login'}});
logged_out_routes.push({route: 'login', name: 'login', moduleId: './pages/login/login', nav: false, title: 'Login'});

export class App {

    configureRouter(config, router) {
        if (Cookies.get('data') !== null) {
          let data = JSON.parse(Cookies.get('data'));
          for (let key in data) {
            Cookies.put(key, data[key]);
          }
        }
        if (Cookies.get('username') === null) {
          config.title = 'MVP';
          config.map(logged_out_routes)
            this.router = router;
            return;
        }

        config.title = 'MVP';
        config.map(logged_in_routes);

        this.router = router;
    }
}
