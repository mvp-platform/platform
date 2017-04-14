# Structures

There are several standardized structures used by the API.

## `book`

Books have the following fields:

* `name`: the name of the book
* `author`: the author of the book
* `uuid`: the id of the book (immutable)
* `chapters`: a list `chapter_instance`s.

### `chapter_instance`

A chapter instance is a specific chapter at a specific commit. This is used
by the `Book` object to reference the exact version.

it is a list containing:

[`chapter_uuid`, `author`, `commit sha`]

The first two fields are required. The commit sha can be `null` if the chapter
is not pinned to a specific version.

## `chapter`

Chapters have the following fields:

* `name`: the name of the chapter
* `author`: the author of the chapter
* `uuid`: the id of the chapter (immutable)
* `scrap`: a list of `scrap_instance` structures.

### `scrap_instance`

A scrap instance is a specific scrap at a specific commit. This is used
by the `Chapter` object to reference the exact version.

it is a list containing:

[`scrap_uuid`, `author`, `commit sha`]

The first two fields are required. The commit sha can be `null` if the scrap
is not pinned to a specific version.

## `scrap`

Scraps have the following fields:

* `author`: the author of the book
* `uuid`: the id of the book (immutable)
* `text`: the text of the scrap

# Backend API calls

## `/books`

### `GET /books/{author}`

Returns all books for a user.

```
[
  {
    "name": "Plumbus",
    "author": "hagrid",
    "uuid": "19b66178-856d-4dad-bbc2-a9575ecfd36b",
    "chapters": [
      [
        "hagrid",
        "aec55377-716d-4274-b006-44913f73ca7f",
        null
      ],
      ...
    ]
  },
  ...
]
```
### `GET /books/{author}/{uuid}`

Returns the information about a single book, given by author and uuid.

```
{
  "name": "Plumbus",
  "author": "hagrid",
  "uuid": "19b66178-856d-4dad-bbc2-a9575ecfd36b",
  "chapters": [
    [
      "hagrid",
      "aec55377-716d-4274-b006-44913f73ca7f",
      null
    ],
    ...
  ]
}
```

### `POST /books/{author}/{uuid}`

Updates a book with information from the request body. Fields that can be updated
are:

* `chapters`
* `name`

Only fields being updated need to be included. If updating chapters,
existing chapters WILL be overwritten; include existing chapters that
you do not wish to remove.

#### Example: change name and change chapter uuid / pin chapter
```
POST /books/hagrid/19b66178-856d-4dad-bbc2-a9575ecfd36b
{
  "name": "New Book Name",
  "chapters": [
    [
      "hagrid",
      "68c47c74-f6fb-4e5b-a68c-f2c6b4265bd1",
      "ad3df920f3ce04687732c5572a76e541e6a1b799"
    ]
  ]
}
```

`POST` update requests return the message body of the new commit:
```
{
  "message": "update: changed name from Hagrid's Big Book of BBQ to New Book Name. changed chapters (TODO diff)"
}
```

### `POST /books/{author}/{book_id}/fork`

TODO

### `GET /books/{author}/{book_id}/pdf`

Returns a PDF file containing the book.

### `GET /books/{author}/{book_id}/history`

Returns the history of the book.

```
[
  [
    "a632575d435f86e19434092fe3e2fca98a3bb7e5",
    "update: changed name from Hagrid's Big Book of BBQ to New Book Name. "
  ],
  [
    "b76c2469b00ee63c0e462faa32a5875abbbd51c7",
    "update: updated chapters (TODO diff). "
  ],
  [
    "15ccb3513d209ca9770cb188ace7fe9bcd97b433",
    "Created book named Hagrid's Big Book of BBQ"
  ]
]
```

### `POST /books/new`

Create a new book object. The name and author are both required; chapters
cannot be added.

```
POST /books/new
{
  "name": "My Favorite Book",
  "author": "magellan"
}
```

`POST` creation requests return a book structure:
```
{
  "name": "My Favorite Book",
  "author": "magellan",
  "uuid": "802619b6-f102-4b63-9fbe-f578c7af671f",
  "chapters": []
}
```

# TODO better explanations here

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

Search:  
`/search?q=plus+separated+query`  

Search for specific types:  
`/search?q=abc123&type=books`  
`/search?q=abc123&type=chapters`  
`/search?q=abc123&type=books&type=chapters`  

Search only current user's items:  
`/search?q=abc&personal=true`

## `/chapters`

Method | Endpoint | Description
---|---|---
`GET` | `/chapters/{author}/{chapter_id}` | get chapter information (incl. scrap list)
`POST` | `/chapters/{author}/{chapter_id}` | *update* chapter information (incl. scrap list)
`POST` | `/chapters/{author}/{chapter_id}/fork` | fork a chapter
`GET` | `/chapters/{author}/{chapter_id}/pdf` | generate PDF of chapter
`GET` | `/chapters/{author}/{chapter_id}/history` | get history of chapter
`POST` | `/chapters/new` | create new chapter object

## `/scraps`

Method | Endpoint | Description
---|---|---
`GET` | `/scraps/{scrap_id}` | get scrap information (incl. scrap body)
`GET` | `/scraps/{scrap_id}/pdf` | generate PDF of scrap
`POST` | `/scraps/{scrap_id}/fork` | fork a scrap
`GET` | `/scraps/{scrap_id}/history` | get history of scrap
`POST` | `/scraps/new` | create new scrap object

## `/account`

Method | Endpoint | Description
---|---|---
`POST` | `/account/login` | Log in
`POST` | `/account/logout` | Log out
`POST` | `/account/new` | Create account
