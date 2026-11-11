// CampusSwap – Week 4: load the listings with fetch (Week 3: JavaScript and the DOM)
'use strict';

const STORAGE_KEY = 'campusswap-listings';

// The listings live in a JSON file now, not in an array in this file
const DATA_URL = 'data.json';

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

  // Empty state
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

// Loading state
function renderLoading() {
  const cards = document.querySelector('#cards');
  cards.innerHTML = '';
  const loading = document.createElement('p');
  loading.className = 'loading';
  loading.textContent = 'Loading books...';
  cards.append(loading);
  document.querySelector('#result-count').textContent = '';
}

// Error state, with a button to try again
function renderError(message, onRetry) {
  const cards = document.querySelector('#cards');
  cards.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'load-error';
  box.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.textContent = `Something went wrong. We could not load the listings (${message}).`;

  const retry = document.createElement('button');
  retry.className = 'btn btn-small';
  retry.type = 'button';
  retry.textContent = 'Try again';
  retry.addEventListener('click', onRetry);

  box.append(text, retry);
  cards.append(box);
  document.querySelector('#result-count').textContent = '';
}

// 404 and 500 do not go to catch by themselves, so check response.ok
async function fetchBooks() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}

function initHomePage() {
  const form = document.querySelector('#search-form');
  const input = document.querySelector('#q');
  let allBooks = [];
  let loaded = false;

  const filter = () => {
    if (!loaded) return; // nothing to search while loading or after an error
    const query = input.value.trim().toLowerCase();
    const result = allBooks.filter((book) =>
      book.title.toLowerCase().includes(query) || book.course.toLowerCase().includes(query)
    );
    renderBooks(result);
  };

  async function loadBooks() {
    loaded = false;
    renderLoading();
    try {
      const books = await fetchBooks();
      allBooks = [...loadSavedBooks(), ...books];
      loaded = true;
      filter(); // success (or empty, if the search box already has text)
    } catch (error) {
      renderError(error.message, loadBooks);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filter();
  });
  input.addEventListener('input', filter);

  loadBooks();
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
