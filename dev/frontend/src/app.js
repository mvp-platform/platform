import { Cookies } from 'aurelia-plugins-cookies';

const loggedInRoutes = [
    { route: '', redirect: 'mybooks' },
    { route: 'mybooks', name: 'mybooks', moduleId: './pages/mybooks/mybooks', nav: true, title: 'My Books', settings: 'library_books' },
    { route: 'mychapters', name: 'mychapters', moduleId: './pages/mychapters/mychapters', nav: true, title: 'My Chapters', settings: 'description' },
    { route: 'myscraps', name: 'myscraps', moduleId: './pages/myscraps/myscraps', nav: true, title: 'My Scraps', settings: 'receipt' },

    { route: 'editBook/:author/:uuid', name: 'editBook', moduleId: './pages/editBook/editBook', nav: false, title: 'Edit Book' },
    { route: 'editchapter/:author/:uuid', name: 'editchapter', moduleId: './pages/editchapter/editchapter', nav: false, title: 'Edit Chapter' },
    { route: 'editscrap/:author/:uuid', name: 'editscrap', moduleId: './pages/editscrap/editscrap', nav: false, title: 'Edit Scrap' },

    { route: 'newscrap/:author/:uuid', name: 'newscrap', moduleId: './pages/editscrap/newscrap', nav: false, title: 'New Scrap' },
    { route: 'newchapter', name: 'newchapter', moduleId: './pages/editchapter/newchapter', nav: false, title: 'New Chapter' },
    { route: 'newbook', name: 'newbook', moduleId: './pages/editBook/newbook', nav: false, title: 'New Book' },

    { route: 'favorites', name: 'favorites', moduleId: './pages/favs/favs', nav: true, title: 'Favorites', settings: 'favorite' },

    { route: 'search', name: 'search', moduleId: './pages/search/mainsearch', nav: true, title: 'Search', settings: 'search' },
    { route: 'profile', name: 'profile', moduleId: './pages/profile', nav: true, title: 'Profile', settings: 'person' },
    { route: 'settings', name: 'settings', moduleId: './pages/settings', nav: true, title: 'Settings', settings: 'settings' },
];

const loggedOutRoutes = loggedInRoutes.map(r => ({ route: r.route, redirect: 'login' }));
loggedOutRoutes.push({ route: 'login', name: 'login', moduleId: './pages/login/login', nav: false, title: 'Login' });

export class App {

  configureRouter(config, router) {
    if (Cookies.get('data') !== null) {
      const data = JSON.parse(Cookies.get('data'));
      for (const key in data) {
        Cookies.put(key, data[key]);
      }
    }
    if (Cookies.get('username') === null) {
      config.title = 'MVP';
      config.map(loggedOutRoutes);
      this.router = router;
      return;
    }

    config.title = 'MVP';
    config.map(loggedInRoutes);

    this.router = router;
  }
}
