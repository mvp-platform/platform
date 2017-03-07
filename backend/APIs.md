# Backend API calls

## `/books`

Method | Endpoint | Description
----|---|----
`GET` | `/books` | List all books (will probably not exist)
`GET` | `/books/{book_id}` | get information about a book (incl. chapter list)
`POST` | `/books/{book_id}` | *update* information about a book (incl. chapter list)
`GET` | `/books/{book_id}/pdf`| generate PDF of book
`GET` | `/books/{book_id}/history` | get history of book
`POSt` | `/books/new` | create new book object

## `/users`

Method | Endpoint | Description
------|-----|-----
`GET` | `/users/{user_id}` | Get information about user account
`GET` | `/users/{user_id}/books` | List user's books
`GET` | `/users/{user_id}/chapters` | List user's chapters
`GET` | `/users/{user_id}/scraps` | List user's scraps
`GET` | `/users/{user_id}/chapters/unassociated` | List user's unassociated chapters
`GET` | `/users/{user_id}/scraps/unassociated` | List user's unassociated scraps
`GET` | `/users/{user_id}/favorites` | List user's favorites
`POST` | `/users/{user_id}/favorites/{object_id}` | Add object to favorites
`DEL` | `/users/{user_id}/favorites/{object_id}` | Remove object from favorites

## `/search`

`/search?q=plus+separated+query`  
`/search?q=abc123&type=books`  
`/search?q=abc123&type=chapters`  
`/search?q=abc123&type=books&type=chapters`  

## `/chapters`

Method | Endpoint | Description
---|---|---
`GET` | `/chapters/{chapter_id}` | get chapter information (incl. scrap list)
`POST` | `/chapters/{chapter_id}` | *update* chapter information (incl. scrap list)
`GET` | `/chapters/{chapter_id}/pdf` | generate PDF of chapter
`GET` | `/chapters/{chapter_id}/history` | get history of chapter
`POST` | `/chapters/new` | create new chapter object

## `/scraps`

Method | Endpoint | Description
---|---|---
`GET` | `/scraps/{scrap_id}` | get scrap information (incl. scrap body)
`GET` | `/scraps/{scrap_id}/pdf` | generate PDF of scrap
`GET` | `/scraps/{scrap_id}/history` | get history of scrap
`POST` | `/scraps/new` | create new scrap object

## `/account`

Method | Endpoint | Description
---|---|---
`POST` | `/account/login` | Log in
`POST` | `/account/logout` | Log out
`POST` | `/account/new` | Create account

