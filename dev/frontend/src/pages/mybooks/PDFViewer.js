export class PDFViewer {
  constructor(bookID) {
    this.url = 'http://remix.ist:8000/books/hagrid/19b66178-856d-4dad-bbc2-a9575ecfd36b/pdf';
    this.documents = [
      /*{
        url: 'src/documents/one.pdf',
        draftUrl: 'src/documents/one.pdf',
        pageNumber: 1,
        scale: 1,
        lastpage: 1
      },*/
      {
        url: 'http://remix.ist:8000/books/hagrid/19b66178-856d-4dad-bbc2-a9575ecfd36b/pdf',
        draftUrl: 'http://remix.ist:8000/books/hagrid/19b66178-856d-4dad-bbc2-a9575ecfd36b/pdf',
        pageNumber: 1,
        scale: 0.8,
        lastpage: 1
      }
    ];
    //console.log(bookID);
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

  activate(bookID) {
    this.url = "http://remix.ist:8000/books/" + bookID.author + '/' + bookID.uuid + '/pdf';
    document.url = this.url
    document.draftUrl = this.url;
  }
}
