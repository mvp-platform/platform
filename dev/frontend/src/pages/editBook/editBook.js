import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Dragula } from 'aurelia-dragula';
import { Cookies } from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MdToastService } from 'aurelia-materialize-bridge';

const httpClient = new HttpClient();

@inject(EventAggregator, MdToastService)
export class EditBook {
    fork(thing) {
        // fork
        var authToken = "Token " + Cookies.get('token');
        httpClient.fetch('https://remix.ist/chapters/' + thing.author + '/' + thing.uuid + '/fork', {
                method: 'post',
                headers: {
                    'Authorization': authToken
                }
            })
            .then(response => response.json())
            .then(data => {
                thing.author = data.author;
            });
    }

    editchapter(c) {
        if (this.hidden) {
            this.router.navigateToRoute('editchapter', c);
        } else {
            this.ech = c;
            this.modal.open();
        }
    }

    pin(i) {
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
        // get history
        httpClient.fetch('https://remix.ist/chapters/' + this.book.chapters[parseInt(i)].author + '/' + this.book.chapters[parseInt(i)].uuid + '/history')
            .then(response => response.json())
            .then(data => {
                this.book.chapters[parseInt(i)].sha = data[0][0];
            });
    }

    unpin(i) {
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
        this.book.chapters[parseInt(i)].sha = null;
    }

    save() {
        // save changes and then head out
        this.saveRearrangements(true);
    }

    discard() {
        this.toast.show('Discarding changes to book...', 5000);
        this.router.navigateToRoute('editchapter', this.ech);
    }

    cancelChanges() {
        this.ech = undefined;
        return;
    }

    favorite(thing) {
        var authToken = "Token " + Cookies.get('token');
        let method;
        if (!thing.favorite) {
            method = 'post';
            thing.favorite = true;
        } else {
            method = 'delete';
            thing.favorite = false;
        }
        // add to favs or remove from favs
        httpClient.fetch('https://remix.ist/chapters/' + thing.author + '/' + thing.uuid + '/favorite', {
                method: method,
                headers: {
                    'Authorization': authToken
                }
            })
            .then(response => response.json())
            .then(data => {
                thing.author = this.author;
            });
    }

    constructor(eventag, toast) {
        this.title = "Edit Book";
        this.hidden = true;
        this.ea = eventag;
        this.toast = toast;
        this.author = Cookies.get('username');
        this.token = "Token " + Cookies.get('token');
    }

    updateName = () => {
        this.nameUpdated = true;
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
    }

    delete(index) {
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
        this.book.chapters.splice(parseInt(index), 1);
    }

    itemDropped(item, target, source, sibling, itemVM, siblingVM) {

        if (source.dataset.search) {
            this.book.chapters.splice(parseInt(target.dataset.index), 0, { author: source.dataset.author, uuid: source.dataset.uuid, favorite: source.dataset.favorite, name: source.dataset.name, sha: null });
        } else {
            var move = function(array, from, to) {
                array.splice(to, 0, array.splice(from, 1)[0]);
            };
            move(this.book.chapters, parseInt(source.dataset.index), parseInt(target.dataset.index));
        }
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
    }

    saveRearrangements(ec) {
        console.log(this.book);
        var theAuthor = Cookies.get('username');
        var authToken = "Token " + Cookies.get('token');

        // have to get rid of the text field to save chapters
        var chapters_change = this.book.chapters.map(function(e) { return [e.author, e.uuid, e.sha] });
        var body = { chapters: chapters_change };

        if (this.nameUpdated) {
            body.name = this.book.name.trim();
        }
        httpClient.fetch('https://remix.ist/books/' + this.book.author + '/' + this.book.uuid, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                document.getElementById('save-warning').click();
                this.hidden = true;
                this.toast.show('This book has successfully been updated.', 5000);
                if (this.ech) {
                    this.router.navigateToRoute('editchapter', this.ech);
                }
            });
    }



    activate(author) {
        httpClient.fetch(`https://remix.ist/books/${author.author}/${author.uuid}`, {
                headers: {
                    'Authorization': "Token " + Cookies.get('token')
                }
            })
            .then(response => response.json())
            .then((data) => {
                this.original_chapters = data.chapters;
                data.chapters = [];
                for (let c of this.original_chapters) {
                    data.chapters.push({ author: c[0], uuid: c[1], sha: c[2], name: c[3], favorite: c[4] });
                }
                this.book = data;
            });


        this.new_subscription = this.ea.subscribe('new-chapter', new_chapter => {
            console.log(new_chapter);
            console.log(new_chapter.chapterAuthor, new_chapter.chapterID, null, new_chapter.requested);
            this.book.chapters.push({ author: new_chapter.chapterAuthor, uuid: new_chapter.chapterID, sha: null, name: new_chapter.requested, favorite: false });
        });
        this.pin_subscription = this.ea.subscribe('pin-chapter', data => {
            this.book.chapters.splice(parseInt(data.index), 1, { author: data.author, uuid: data.uuid, sha: data.sha, name: "(refresh to see name)", favorite: this.book.chapters[parseInt(data.index)].favorite });
            if (this.hidden) {
                document.getElementById('save-warning').click();
                this.hidden = false;
            }
        });
    }

    configureRouter(config, router) {
        config.title = 'Book Tabs';
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: ['newchapter'], name: 'newchapter', moduleId: 'pages/editchapter/newchapter', nav: false, title: 'New Chapter' },
            { route: ['mychaptersside'], name: 'mychaptersside', moduleId: 'pages/mychapters/mychaptersside', nav: true, title: 'My Chapters' },
            { route: 'search', name: 'search', moduleId: 'pages/search/search', settings: { type: 'chapter' }, nav: true, title: 'Search' },
            { route: 'favs', name: 'favs', moduleId: 'pages/favs/favpanel', settings: { type: 'chapter' }, nav: true, title: 'Favorites' },
            { route: ['editTimeline', 'editTimeline/:type/:author/:uuid/:current?'], name: 'editTimeline', moduleId: 'pages/editTimeline/editTimeline', nav: false, title: 'Edit Timeline' },
        ]);
        this.router = router;
    }
}
