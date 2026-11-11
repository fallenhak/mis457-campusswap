# CampusSwap

MIS 457 – Web Based Application Programming · Team Project

A platform where students buy, sell and swap used textbooks on campus.

## Team

| Name | Student ID |
|---|---|
| Kerim Burak Tuz | 240106436 |
| Yusuf Efe Akar | 240106421 |
| Ali Yusuf Bayram | 240106419 |
| Utku Kaan Yücebıyık | 240106416 |

## Week 2 – Static prototype

- `index.html` – home page (semantic HTML, Flexbox header, mobile-first card grid)
- `post.html` – "Post a book" form, every input labelled
- `style.css` – shared styles, responsive at 375px and 1280px

Live: https://fallenhak.github.io/mis457-campusswap/

## Week 3 – JavaScript and the DOM

- `app.js` – all JavaScript, loaded with `defer` on both pages
- **Dynamic list:** the listing cards on the home page are built from the `books` array with `createElement` / `append`
- **Search:** filters the array by title or course code as you type, with a live result count and an empty state
- **Validation:** the "Post a book" form uses `preventDefault()` and shows a clear error message under each invalid field (title, course code format, condition, sell/swap, price, name, email), plus a summary message at the top
- **Bonus:** a valid listing is saved to `localStorage` and appears first on the home page with a "New" badge

## Week 4 – Fetch, async/await and JSON

- `data.json` – the listings moved out of `app.js` into a JSON file
- **Fetch:** `app.js` loads `data.json` with `fetch` and `async` / `await` inside `try` / `catch`, and checks `response.ok` so a 404 or 500 is shown as an error
- **Four UI states** on the home page:
  - **Loading** – "Loading books..." while the request is waiting
  - **Success** – the cards are built from the fetched data
  - **Empty** – "No books match your search." when the search finds nothing
  - **Error** – "Something went wrong..." with the HTTP status and a "Try again" button
- **Search** still filters live by title or course code, now on the fetched data
- Listings posted from the form (`localStorage`) are still shown first

Run it with Live Server (Go Live) or the live link: `fetch` does not work when the file is opened with a double-click.

## Week 5 – Node.js, Express and our own REST API

The listings now come from our own API in the `api` folder, not from `data.json`.

### REST table

| Method | URL | Meaning | Success | Errors |
|---|---|---|---|---|
| GET | `/api/books` | List all books | 200 | – |
| GET | `/api/books/:id` | One book | 200 | 404 |
| POST | `/api/books` | Create a book | 201 | 400 |
| PUT | `/api/books/:id` | Update a book | 200 | 400, 404 |
| DELETE | `/api/books/:id` | Delete a book | 204 | 404 |

Every error has the same format: `{ "error": "message" }`.

A book looks like this:

```json
{ "id": 1, "course": "MIS 457", "title": "Web Development with HTML & CSS", "note": "Good condition, some highlights.", "offer": "sell", "price": 250 }
```

For POST, `title`, `course` and `offer` (`"sell"` or `"swap"`) are required, and a book you sell needs a `price` greater than 0.

### Files

- `api/server.js` – the Express server: `express.json()`, `cors()`, a logger middleware, the five routes and the error handlers. The data is in an array, so restarting the server resets it.
- `api/package.json` – the packages (`express`, `cors`). `node_modules` is in `.gitignore`.
- `app.js` – the home page loads the books with `GET /api/books`; the "Post a book" form sends the listing with `POST /api/books` and shows the API's error message if the API answers 400.
- `postman/CampusSwap.postman_collection.json` – a Postman collection with all requests, including the 400 and 404 cases.

### How to run

1. Start the API:

   ```
   cd api
   npm install
   npm start
   ```

   The terminal says `CampusSwap API on http://localhost:3000`.
2. Open `index.html` with Live Server (Go Live).
3. Postman: Import → `postman/CampusSwap.postman_collection.json`, then send the requests.

If the API is not running, the home page shows the error state with a "Try again" button.

The live link is on GitHub Pages, which only hosts static files and cannot run the Express server. The live demo therefore still reads `data.json` (the Week 4 version). The API version runs on your own computer.

## Lighthouse

Accessibility score: **100**

![Lighthouse report](lighthouse-accessibility.png)
