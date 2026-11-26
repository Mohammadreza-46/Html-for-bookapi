import { BASE_URL, PER_PAGE } from "./config.js";
import { state } from "./state.js";
import { apiRequest } from "./api.js";
import { resetFilters, hasFilters, addFilterParams, loadGenres } from "./filters.js";
import { showBooksList, openBook } from "./js/book-detail.js";
import {
  booksTitle, booksGrid, filtersBar, pageBox, pageNumber, booksInfo,
  prevBtn, nextBtn, searchBtn, clearSearchBtn
} from "./dom.js";

const BOOK_ENDPOINTS = {
  books: "/get_all_book",
  mybooks: "/my_books"
};

const BOOK_TITLES = {
  books: "Books",
  mybooks: "My Books"
};

export function isBookSection(name) {
  return Boolean(BOOK_ENDPOINTS[name]);
}

export function setSearchUI(active, count) {
  state.searchActive = active;
  clearSearchBtn.hidden = !active;
  pageBox.hidden = active;
  filtersBar.hidden = active || state.currentSection !== "books";

  if (active) {
    booksTitle.textContent = "Search results (" + count + ")";
  } else {
    booksTitle.textContent = BOOK_TITLES[state.currentSection] || "Books";
  }
}

function showGridMessage(text) {
  booksGrid.textContent = "";
  const message = document.createElement("p");
  message.className = "books-message";
  message.textContent = text;
  booksGrid.appendChild(message);
}

export function renderBooks(books) {
  booksGrid.textContent = "";

  if (books.length === 0) {
    if (state.searchActive) {
      showGridMessage("No books match your search");
    } else if (state.currentSection === "mybooks") {
      showGridMessage("You have not added any books yet");
    } else if (hasFilters()) {
      showGridMessage("No books match these filters");
    } else {
      showGridMessage("No books found");
    }
    return;
  }

  books.forEach(function (book) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "book-card";

    const name = document.createElement("span");
    name.textContent = book.book_name;
    card.appendChild(name);

    card.addEventListener("click", function () {
      openBook(book.book_id);
    });

    booksGrid.appendChild(card);
  });
}

function updatePagination(meta) {
  state.currentPage = meta.page;
  state.totalPages = meta.total_pages;

  pageNumber.textContent = meta.page + " / " + Math.max(meta.total_pages, 1);
  booksInfo.textContent = meta.total + (meta.total === 1 ? " book" : " books");

  prevBtn.disabled = meta.page <= 1;
  nextBtn.disabled = meta.page >= meta.total_pages;
}

export async function loadBooks(page) {
  const endpoint = BOOK_ENDPOINTS[state.currentSection];
  if (!endpoint) {
    return null;
  }

  const myLoad = ++state.loadId;
  const params = new URLSearchParams({
    page: page,
    per_page: PER_PAGE
  });

  addFilterParams(params);

  booksInfo.textContent = "Loading...";
  prevBtn.disabled = true;
  nextBtn.disabled = true;

  try {
    const result = await apiRequest(BASE_URL + endpoint + "?" + params.toString());

    if (myLoad !== state.loadId) {
      return null;
    }

    if (result === null) {
      return null;
    }

    if (!result.ok) {
      showGridMessage("Server error: " + result.status);
      booksInfo.textContent = "";
      return null;
    }

    renderBooks(result.data.book);
    updatePagination(result.data.pagination);
    return result.data;
  } catch (error) {
    if (myLoad === state.loadId) {
      showGridMessage("Error loading books");
      booksInfo.textContent = "";
    }
    return null;
  }
}

export function fetchSearch(body) {
  return apiRequest(BASE_URL + "/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export async function refreshSearch() {
  if (!state.lastSearchBody) {
    return;
  }

  const myLoad = ++state.loadId;

  try {
    const result = await fetchSearch(state.lastSearchBody);

    if (result === null || myLoad !== state.loadId) {
      return;
    }

    if (result.ok && Array.isArray(result.data)) {
      renderBooks(result.data);
      setSearchUI(true, result.data.length);
    }
  } catch (error) {
    showGridMessage("Error loading books");
  }
}

export function refreshList() {
  if (state.searchActive) {
    return refreshSearch();
  }
  return loadBooks(state.currentPage);
}

export function exitSearch() {
  state.lastSearchBody = null;
  setSearchUI(false);
  return loadBooks(state.currentPage);
}

export function prevPage() {
  if (state.currentPage > 1) {
    loadBooks(state.currentPage - 1);
  }
}

export function nextPage() {
  if (state.currentPage < state.totalPages) {
    loadBooks(state.currentPage + 1);
  }
}

export function enterBooksSection(name) {
  state.lastSearchBody = null;
  searchBtn.hidden = name !== "books";
  resetFilters();
  setSearchUI(false);
  state.currentPage = 1;
  showBooksList();

  if (name === "books") {
    loadGenres();
  }

  loadBooks(1);
}
