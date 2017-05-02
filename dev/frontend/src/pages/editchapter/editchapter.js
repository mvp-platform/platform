import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Dragula } from 'aurelia-dragula';
import { Cookies } from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import { MdToastService } from 'aurelia-materialize-bridge';
import { EventAggregator } from 'aurelia-event-aggregator';

let httpClient = new HttpClient();

@inject(EventAggregator, MdToastService)
export class EditChapters {
    constructor(eventag, toast) {
        this.hidden = true;
        this.toast = toast;
        this.ea = eventag;
    }

    fork(thing) {
        // fork
        var authToken = "Token " + Cookies.get('token');
        httpClient.fetch('https://remix.ist/scraps/' + thing.author + '/' + thing.uuid + '/fork', {
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

    pin(i) {
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
        // get history
        httpClient.fetch('https://remix.ist/scraps/' + this.chapter.scraps[parseInt(i)].author + '/' + this.chapter.scraps[parseInt(i)].uuid + '/history')
            .then(response => response.json())
            .then(data => {
                this.chapter.scraps[parseInt(i)].sha = data[0][0];
            });
    }

    unpin(i) {
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
        this.chapter.scraps[parseInt(i)].sha = null;
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
        httpClient.fetch('https://remix.ist/scraps/' + thing.author + '/' + thing.uuid + '/favorite', {
            method: method,
            headers: {
                'Authorization': authToken
            }
        });
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
        this.chapter.scraps.splice(parseInt(index), 1);
    }


    itemDropped(item, target, source, sibling, itemVM, siblingVM) {
        if (source.dataset.search) {
            this.chapter.scraps.splice(parseInt(target.dataset.index), 0, { author: source.dataset.author, uuid: source.dataset.uuid, sha: null, text: source.dataset.text });
        } else {
            var move = function(array, from, to) {
                array.splice(to, 0, array.splice(from, 1)[0]);
            };
            move(this.chapter.scraps, parseInt(source.dataset.index), parseInt(target.dataset.index));
        }
        if (this.hidden) {
            document.getElementById('save-warning').click();
            this.hidden = false;
        }
    }

    saveRearrangements() {
        var theAuthor = Cookies.get('username');
        var authToken = "Token " + Cookies.get('token');

        // have to get rid of the text field to save scraps
        var scraps_change = this.chapter.scraps.map(function(e) { return [e.author, e.uuid, e.sha] });
        var body = { scraps: scraps_change };
        if (this.nameUpdated) {
            body.name = this.chapter.name.trim();
        }
        httpClient.fetch('https://remix.ist/chapters/' + this.chapter.author + '/' + this.chapter.uuid, {
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
                this.toast.show('Chapter saved successfully!', 5000);
                this.hidden = true;
                document.getElementById('save-warning').click();
            });
    }

    activate(author) {

        this.chapter = null;

        httpClient.fetch('https://remix.ist/chapters/' + author.author + '/' + author.uuid, {
                headers: {
                    'Authorization': "Token " + Cookies.get('token')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.original_scraps = data.scraps;
                data.scraps = [];
                for (let c of this.original_scraps) {
                    data.scraps.push({ author: c[0], uuid: c[1], sha: c[2], text: c[3], favorite: c[4], image: c[5] });
                }
                this.chapter = data;
            });

        this.new_subscription = this.ea.subscribe('new-scrap', scrap => {
            this.chapter.scraps.push({ author: scrap.author, uuid: scrap.uuid, sha: null, text: scrap.text, favorite: false, image: false });
            this.router.navigateToRoute('PDFViewer', { type: 'scraps', author: scrap.author, uuid: scrap.uuid });
        });
        this.edit_subscription = this.ea.subscribe('edit-scrap', data => {
            console.log("RECEIVED EDITED SCRAP");
            console.log(data);
            this.chapter.scraps.splice(parseInt(data.index), 1, { author: data.author, uuid: data.uuid, sha: null, text: data.text, favorite: this.chapter.scraps[parseInt(data.index)].favorite, image: false });
            console.log(this.chapter.scraps);
            this.router.navigateToRoute('PDFViewer', { type: 'scraps', author: data.author, uuid: data.uuid });
        });

    }

    detached() {
        this.new_subscription.dispose();
        this.edit_subscription.dispose();
    }

    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: ['newscrap', 'new/:author/:uuid'], name: 'newscrap', moduleId: 'pages/editscrap/newscrap', nav: false, title: 'New Scrap' },
            { route: ['editscrap', 'edit/:author/:uuid'], name: 'editscrap', moduleId: 'pages/editscrap/editscrap', nav: false, title: 'Edit Scrap' },
            { route: ['myscrapsside'], name: 'myscrapsside', moduleId: 'pages/myscraps/myscrapsside', nav: true, title: 'My Scraps' },
            { route: 'search', name: 'search', settings: { type: "scrap" }, moduleId: 'pages/search/search', nav: true, title: 'Search' },
            { route: 'favs', name: 'favs', settings: { type: 'scrap' }, moduleId: 'pages/favs/favpanel', nav: true, title: 'Favorites' },
            { route: ['editTimeline', 'editTimeline/:type/:author/:uuid'], name: 'editTimeline', moduleId: 'pages/editTimeline/editTimeline', nav: false, title: 'Edit Timeline' },
        ]);
        this.router = router;
    }
}
