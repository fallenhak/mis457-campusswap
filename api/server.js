// CampusSwap – Week 5: our own REST API with Express
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

/* ---------- Middleware ---------- */

app.use(cors());         // the page runs on port 5500, the API on 3000
app.use(express.json()); // needed for req.body

// Logger: print every request in the terminal
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

/* ---------- Data ---------- */

// The data is in an array. Restart the server = the data resets.
let books = [
  { id: 1, course: 'MIS 457', title: 'Web Development with HTML & CSS', note: 'Good condition, some highlights.', offer: 'sell', price: 250 },
  { id: 2, course: 'ECON 101', title: 'Principles of Economics', note: 'Like new, 9th edition.', offer: 'sell', price: 400 },
  { id: 3, course: 'STAT 201', title: 'Introductory Statistics', note: 'Looking to swap for a MATH 102 book.', offer: 'swap', price: 0 },
  { id: 4, course: 'MIS 301', title: 'Database Systems', note: 'Notes included in the margins.', offer: 'sell', price: 300 },
  { id: 5, course: 'MGMT 210', title: 'Organizational Behavior', note: 'Cover slightly worn.', offer: 'sell', price: 180 },
  { id: 6, course: 'ENG 102', title: 'Academic Writing', note: 'Swap for any business book.', offer: 'swap', price: 0 }
];

// Returns an error message, or '' when the book is valid
function validateBook(book) {
  if (!book.title || !book.course || !book.offer) {
    return 'title, course and offer are required';
  }
  if (book.offer !== 'sell' && book.offer !== 'swap') {
    return 'offer must be "sell" or "swap"';
  }
  if (book.offer === 'sell' && !(Number(book.price) > 0)) {
    return 'price must be greater than 0 for a book you sell';
  }
  return '';
}

/* ---------- Routes ---------- */

// List all books
app.get('/api/books', (req, res) => {
  res.json(books);
});

// One book by id
app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id); // params are always text
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

// Create a book
app.post('/api/books', (req, res) => {
  const { title, course, note, condition, offer, price } = req.body ?? {};

  const error = validateBook({ title, course, offer, price });
  if (error) {
    return res.status(400).json({ error });
  }

  const book = {
    id: Date.now(),
    course,
    title,
    note: note ?? '',
    condition: condition ?? '',
    offer,
    price: offer === 'sell' ? Number(price) : 0
  };
  books.unshift(book); // newest first
  res.status(201).json(book);
});

// Update a book
app.put('/api/books/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const body = req.body ?? {};
  const updated = {
    ...book,
    course: body.course ?? book.course,
    title: body.title ?? book.title,
    note: body.note ?? book.note,
    condition: body.condition ?? book.condition,
    offer: body.offer ?? book.offer,
    price: body.price ?? book.price
  };

  const error = validateBook(updated);
  if (error) {
    return res.status(400).json({ error });
  }

  updated.price = updated.offer === 'sell' ? Number(updated.price) : 0;
  Object.assign(book, updated);
  res.json(book);
});

// Delete a book
app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!books.some((b) => b.id === id)) {
    return res.status(404).json({ error: 'Book not found' });
  }
  books = books.filter((b) => b.id !== id);
  res.status(204).end();
});

/* ---------- Errors: same format everywhere ---------- */

// Any other path
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Broken JSON in the body, or a bug on the server
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`CampusSwap API on http://localhost:${PORT}`);
});
