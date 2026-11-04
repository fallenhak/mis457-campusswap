// CampusSwap – Week 3: JavaScript and the DOM
'use strict';

const STORAGE_KEY = 'campusswap-listings';

// Dynamic list: every card on the home page is made from this array
const books = [
  { course: 'MIS 457', title: 'Web Development with HTML & CSS', note: 'Good condition, some highlights.', offer: 'sell', price: 250 },
  { course: 'ECON 101', title: 'Principles of Economics', note: 'Like new, 9th edition.', offer: 'sell', price: 400 },
  { course: 'STAT 201', title: 'Introductory Statistics', note: 'Looking to swap for a MATH 102 book.', offer: 'swap', price: 0 },
  { course: 'MIS 301', title: 'Database Systems', note: 'Notes included in the margins.', offer: 'sell', price: 300 },
  { course: 'MGMT 210', title: 'Organizational Behavior', note: 'Cover slightly worn.', offer: 'sell', price: 180 },
  { course: 'ENG 102', title: 'Academic Writing', note: 'Swap for any business book.', offer: 'swap', price: 0 }
];

// Listings posted from the form are kept in this browser
function loadSavedBooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBook(book) {
  const saved = loadSavedBooks();
  saved.unshift(book);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage is blocked (e.g. private mode); the listing just isn't kept
  }
}

/* ---------- Home page: render + search ---------- */

function createCard(book) {
  const article = document.createElement('article');
  article.className = 'card';

  const tag = document.createElement('p');
  tag.className = 'tag';
  tag.textContent = book.course;
  if (book.isNew) {
    const badge = document.createElement('span');
    badge.className = 'new';
    badge.textContent = 'New';
    tag.append(badge);
  }

  const title = document.createElement('h3');
  title.textContent = book.title;

  const note = document.createElement('p');
  note.textContent = book.note || `Condition: ${book.condition}`;

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = book.offer === 'swap' || book.price === 0 ? 'Free ' : `₺${book.price} `;
  const offer = document.createElement('span');
  offer.textContent = book.offer === 'swap' ? '· Swap' : '· Sell';
  price.append(offer);

  article.append(tag, title, note, price);
  return article;
}

function renderBooks(list) {
  const cards = document.querySelector('#cards');
  const count = document.querySelector('#result-count');
  cards.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No books match your search. Try another title or course code.';
    cards.append(empty);
  } else {
    list.forEach((book) => cards.append(createCard(book)));
  }

  count.textContent = `${list.length} ${list.length === 1 ? 'book' : 'books'} found`;
}

function initHomePage() {
  const allBooks = [...loadSavedBooks(), ...books];
  const form = document.querySelector('#search-form');
  const input = document.querySelector('#q');

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    const result = allBooks.filter((book) =>
      book.title.toLowerCase().includes(query) || book.course.toLowerCase().includes(query)
    );
    renderBooks(result);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filter();
  });
  input.addEventListener('input', filter);

  renderBooks(allBooks);
}

/* ---------- Post page: validation ---------- */

const rules = {
  title: (v) => (v.length < 3 ? 'Please enter the book title (at least 3 characters).' : ''),
  course: (v) => (!/^[A-Za-z]{2,5}\s?\d{3}$/.test(v) ? 'Enter a course code like "MIS 457".' : ''),
  condition: (v) => (v === '' ? 'Please choose the condition of the book.' : ''),
  name: (v) => (v.length < 3 ? 'Please enter your full name.' : ''),
  email: (v) => {
    if (v === '') return 'Please enter your university email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'This email address is not valid (example: name@uni.edu.tr).';
    return '';
  }
};

function showError(id, message) {
  const field = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  error.textContent = message;
  if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateField(id) {
  const value = document.getElementById(id).value.trim();
  const message = rules[id](value);
  showError(id, message);
  return message === '';
}

function validateOffer(form) {
  const offer = form.querySelector('input[name="offer"]:checked');
  const priceValue = form.elements.price.value.trim();
  let ok = true;

  document.getElementById('offer-error').textContent = offer ? '' : 'Please choose Sell or Swap.';
  if (!offer) ok = false;

  let priceMessage = '';
  if (offer && offer.value === 'sell') {
    const price = Number(priceValue);
    if (priceValue === '') priceMessage = 'Please enter a price for a book you are selling.';
    else if (price <= 0 || price > 5000) priceMessage = 'Price must be between ₺1 and ₺5000.';
  }
  showError('price', priceMessage);
  return ok && priceMessage === '';
}

function initPostPage() {
  const form = document.querySelector('#post-form');
  const status = document.querySelector('#form-status');

  // Check each field when the user leaves it
  Object.keys(rules).forEach((id) => {
    document.getElementById(id).addEventListener('blur', () => validateField(id));
  });
  form.querySelectorAll('input[name="offer"]').forEach((radio) =>
    radio.addEventListener('change', () => validateOffer(form))
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const results = Object.keys(rules).map(validateField);
    const offerOk = validateOffer(form);
    const allOk = results.every(Boolean) && offerOk;

    status.hidden = false;
    if (!allOk) {
      status.className = 'form-status is-error';
      status.textContent = 'Please fix the errors marked in red below.';
      form.querySelector('[aria-invalid="true"], input[name="offer"]:not(:checked)')?.focus();
      return;
    }

    const offer = form.querySelector('input[name="offer"]:checked').value;
    saveBook({
      course: form.elements.course.value.trim().toUpperCase(),
      title: form.elements.title.value.trim(),
      note: form.elements.description.value.trim(),
      condition: form.elements.condition.value,
      offer,
      price: offer === 'sell' ? Number(form.elements.price.value) : 0,
      isNew: true
    });

    status.className = 'form-status is-success';
    status.innerHTML = '';
    status.append(`Your book "${form.elements.title.value.trim()}" is now listed. `);
    const link = document.createElement('a');
    link.href = 'index.html#listings';
    link.textContent = 'See it in the listings';
    status.append(link);
    form.reset();
  });
}

if (document.querySelector('#cards')) initHomePage();
if (document.querySelector('#post-form')) initPostPage();
