export class PDFViewer {
    constructor(scrapID) {
        this.url = '/src/assets/blank.pdf';
        this.documents = [
            /*{
              url: 'src/documents/one.pdf',
              draftUrl: 'src/documents/one.pdf',
              pageNumber: 1,
              scale: 1,
              lastpage: 1
            },*/
            {
                url: '/src/assets/blank.pdf',
                draftUrl: '/src/assets/blank.pdf',
                pageNumber: 1,
                scale: 0.8,
                lastpage: 1
            }
        ];
    }

    loadUrl(document) {
        document.url = document.draftUrl;
    }

    firstPage(document) {
        document.pageNumber = 1;
    }

    nextPage(document) {
        if (document.pageNumber >= document.lastpage) return;

        document.pageNumber += 1;
    }

    prevPage(document) {
        if (document.pageNumber <= 1) return;

        document.pageNumber -= 1;
    }

    lastPage(document) {
        document.pageNumber = document.lastpage;
    }

    goToPage(document, page) {
        if (page <= 0 || page > document.lastpage) return;

        document.pageNumber = page;
    }

    zoomIn(document) {
        document.scale = Number(document.scale) + 0.1;
    }

    zoomOut(document) {
        document.scale = Number(document.scale) - 0.1;
    }

    activate(scrapID) {
        if (scrapID.author === undefined) {
            return;
        }

        console.log(scrapID);

        this.url = "http://remix.ist:8000/scraps/" + scrapID.author + '/' + scrapID.uuid + '/pdf';
        //this.url = "http://remix.ist:8000/chapters/" + chapterID.author + '/' + chapterID.uuid + '/pdf';
        document.url = this.url
        document.draftUrl = this.url;
    }
}