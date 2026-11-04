# CampusSwap

MIS 457 – Web Based Application Programming · Team Project

A platform where students buy, sell and swap used textbooks on campus.

## Team

| Name | Student ID |
|---|---|
| Kerim Burak Tuz | 240106436 |
| Yusuf Efe Akar | 240106421 |
| Ali Yusuf Bayram | 240106419 |

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

## Lighthouse

Accessibility score: **100**

![Lighthouse report](lighthouse-accessibility.png)
