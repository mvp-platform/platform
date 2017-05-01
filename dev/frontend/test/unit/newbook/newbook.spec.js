import { NewBook } from 'pages/editBook/newbook';

describe('NewBook module', () => {

    let newbook;

    beforeEach(() => {
        newbook = new NewBook();
    });

    describe('the constructor of NewBook', () => {
        it('constructs with a title property of "New Book"', () => {
            expect(newbook.title).toEqual('New Book');
        });
        it('is "hidden" at first', () => {
            expect(newbook.hidden).toEqual(true);
        });

    })

});