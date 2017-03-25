export class PdfViewer {
  constructor() {
    // Set up some sensible defaults for documents to use with our repeater.
/*
    this.tabSchema = [
      { id: 'tab-one', label: 'My First Section', viewModel: '', icon: 'fa fa-gear', defaultTab: true },
      { id: 'tab-two', label: 'Users', viewModel: './tab-two-view-model', icon: '' },
      { id: 'tab-three', label: 'Browse Items', viewModel: './tab-three-view-model', model: this.modelData, icon: '' }
    ];

    this.modelData = { first: 'first', second: 'second' }
*/
    this.documents = [
      /*{
        url: 'src/documents/one.pdf',
        draftUrl: 'src/documents/one.pdf',
        pageNumber: 1,
        scale: 1,
        lastpage: 1
      },*/
      {
        url: 'src/documents/two.pdf',
        draftUrl: 'src/documents/two.pdf',
        pageNumber: 1,
        scale: 1,
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
}
