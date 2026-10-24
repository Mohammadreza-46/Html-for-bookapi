const BASE_URL = "http://localhost:5000";
const PER_PAGE = 12;

const urls = {
  signup: BASE_URL + "/signup",
  login: BASE_URL + "/login"
};

const SECTION_PANEL = {
  dashboard: "dashboard",
  books: "books",
  mybooks: "books"
};

const BOOK_ENDPOINTS = {
  books: "/get_all_book",
  mybooks: "/my_books"
};

const BOOK_TITLES = {
  books: "Books",
  mybooks: "My Books"
};

const authBox = document.getElementById("auth-box");
const dashboardBox = document.getElementById("dashboard-box");
const dashboardMessage = document.getElementById("dashboard-message");
const logoutBtn = document.getElementById("logout-btn");
const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll("[data-panel]");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submit-btn");
const switchLabel = document.getElementById("switch-label");
const switchLink = document.getElementById("switch-link");

const booksTitle = document.getElementById("books-title");
const booksGrid = document.getElementById("books-grid");
const pageBox = document.getElementById("page-box");
const pageNumber = document.getElementById("page-number");
const booksInfo = document.getElementById("books-info");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const booksListView = document.getElementById("books-list-view");
const bookDetailView = document.getElementById("book-detail-view");
const backBtn = document.getElementById("back-btn");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");
const detailTitle = document.getElementById("detail-title");
const detailId = document.getElementById("detail-id");
const detailWriter = document.getElementById("detail-writer");
const detailGenre = document.getElementById("detail-genre");
const detailYear = document.getElementById("detail-year");
const detailRating = document.getElementById("detail-rating");
const detailAddedBy = document.getElementById("detail-added-by");
const detailCreated = document.getElementById("detail-created");
const detailAdded = document.getElementById("detail-added");
const detailContent = document.getElementById("detail-content");

const addBtn = document.getElementById("add-btn");
const addModal = document.getElementById("add-modal");
const addForm = document.getElementById("add-form");
const formTitle = document.getElementById("form-title");
const addName = document.getElementById("add-name");
const addWriter = document.getElementById("add-writer");
const addGenre = document.getElementById("add-genre");
const addId = document.getElementById("add-id");
const addYear = document.getElementById("add-year");
const addRating = document.getElementById("add-rating");
const addCreated = document.getElementById("add-created");
const addContent = document.getElementById("add-content");
const addError = document.getElementById("add-error");
const addCancel = document.getElementById("add-cancel");
const addSubmit = document.getElementById("add-submit");

const searchBtn = document.getElementById("search-btn");
const clearSearchBtn = document.getElementById("clear-search-btn");
const searchModal = document.getElementById("search-modal");
const searchForm = document.getElementById("search-form");
const searchName = document.getElementById("search-name");
const searchWriter = document.getElementById("search-writer");
const searchGenre = document.getElementById("search-genre");
const searchError = document.getElementById("search-error");
const searchCancel = document.getElementById("search-cancel");
const searchSubmit = document.getElementById("search-submit");
const idForm = document.getElementById("id-form");
const idSearchInput = document.getElementById("id-search-input");
const idSearchSubmit = document.getElementById("id-search-submit");
const idError = document.getElementById("id-error");

const deleteModal = document.getElementById("delete-modal");
const deleteText = document.getElementById("delete-text");
const deleteError = document.getElementById("delete-error");
const deleteCancel = document.getElementById("delete-cancel");
const deleteConfirm = document.getElementById("delete-confirm");

const toast = document.getElementById("toast");

let mode = "signup";
let formMode = "add";
let currentSection = "dashboard";
let currentPage = 1;
let totalPages = 0;
let toastTimer = null;
let openedBook = null;
let loadId = 0;
let searchActive = false;
let lastSearchBody = null;

function saveTokens(token, refreshToken) {
  localStorage.setItem("token", token);
  localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
}

function getUsernameFromToken() {
  try {
    const token = localStorage.getItem("token");
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)).sub;
  } catch (error) {
    return null;
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(BASE_URL + "/refresh_token", {
    method: "POST",
    headers: { Authorization: "Bearer " + refreshToken }
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  return true;
}

async function authFetch(url, options = {}) {
  function send() {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });
  }

  let response = await send();

  if (response.status === 401 && (await refreshAccessToken())) {
    response = await send();
  }

  return response;
}

function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.hidden = true;
  }, 2500);
}

function setSearchUI(active, count) {
  searchActive = active;
  clearSearchBtn.hidden = !active;
  pageBox.hidden = active;

  if (active) {
    booksTitle.textContent = "Search results (" + count + ")";
  } else {
    booksTitle.textContent = BOOK_TITLES[currentSection] || "Books";
  }
}

function showSection(name) {
  currentSection = name;

  navItems.forEach(function (item) {
    item.classList.toggle("active", item.dataset.section === name);
  });

  panels.forEach(function (panel) {
    panel.hidden = panel.dataset.panel !== SECTION_PANEL[name];
  });

  if (BOOK_ENDPOINTS[name]) {
    lastSearchBody = null;
    searchBtn.hidden = name !== "books";
    setSearchUI(false);
    currentPage = 1;
    showBooksList();
    loadBooks(1);
  }
}

function showAuth() {
  addModal.hidden = true;
  deleteModal.hidden = true;
  searchModal.hidden = true;
  dashboardBox.hidden = true;
  authBox.hidden = false;
}

async function showDashboard() {
  const response = await authFetch(BASE_URL + "/dashboard");

  if (!response.ok) {
    showAuth();
    return;
  }

  const data = await response.json();
  dashboardMessage.textContent = data.message;
  authBox.hidden = true;
  dashboardBox.hidden = false;
  showSection("dashboard");
}

function showBooksList() {
  bookDetailView.hidden = true;
  booksListView.hidden = false;
  openedBook = null;
}

function showGridMessage(text) {
  booksGrid.textContent = "";
  const message = document.createElement("p");
  message.className = "books-message";
  message.textContent = text;
  booksGrid.appendChild(message);
}

function renderBooks(books) {
  booksGrid.textContent = "";

  if (books.length === 0) {
    if (searchActive) {
      showGridMessage("No books match your search");
    } else if (currentSection === "mybooks") {
      showGridMessage("You have not added any books yet");
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
  currentPage = meta.page;
  totalPages = meta.total_pages;

  pageNumber.textContent = meta.page + " / " + Math.max(meta.total_pages, 1);
  booksInfo.textContent = meta.total + (meta.total === 1 ? " book" : " books");

  prevBtn.disabled = meta.page <= 1;
  nextBtn.disabled = meta.page >= meta.total_pages;
}

async function loadBooks(page) {
  const endpoint = BOOK_ENDPOINTS[currentSection];
  if (!endpoint) {
    return null;
  }

  const myLoad = ++loadId;
  const params = new URLSearchParams({
    page: page,
    per_page: PER_PAGE
  });

  booksInfo.textContent = "Loading...";
  prevBtn.disabled = true;
  nextBtn.disabled = true;

  try {
    const response = await authFetch(BASE_URL + endpoint + "?" + params.toString());

    if (myLoad !== loadId) {
      return null;
    }

    if (response.status === 401) {
      clearTokens();
      showAuth();
      return null;
    }

    if (!response.ok) {
      showGridMessage("Server error: " + response.status);
      booksInfo.textContent = "";
      return null;
    }

    const data = await response.json();

    if (myLoad !== loadId) {
      return null;
    }

    renderBooks(data.book);
    updatePagination(data.pagination);
    return data;
  } catch (error) {
    if (myLoad === loadId) {
      showGridMessage("Error loading books");
      booksInfo.textContent = "";
    }
    return null;
  }
}

async function fetchSearch(body) {
  const response = await authFetch(BASE_URL + "/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (response.status === 401) {
    clearTokens();
    showAuth();
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  return { ok: response.ok, status: response.status, data: data };
}

async function refreshSearch() {
  if (!lastSearchBody) {
    return;
  }

  const myLoad = ++loadId;

  try {
    const result = await fetchSearch(lastSearchBody);

    if (result === null || myLoad !== loadId) {
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

function refreshList() {
  if (searchActive) {
    return refreshSearch();
  }
  return loadBooks(currentPage);
}

function exitSearch() {
  lastSearchBody = null;
  setSearchUI(false);
  return loadBooks(currentPage);
}

function fillDetail(book) {
  function text(value) {
    return value === undefined || value === null || value === "" ? "-" : value;
  }

  detailTitle.textContent = text(book.book_name);
  detailId.textContent = text(book.book_id);
  detailWriter.textContent = text(book.writer);
  detailGenre.textContent = text(book.genre);
  detailYear.textContent = text(book.published_year);
  detailRating.textContent = book.rating === undefined ? "-" : book.rating + "/5";
  detailAddedBy.textContent = text(book.added_by);
  detailCreated.textContent = text(book.created_at);
  detailAdded.textContent = text(book.added_at);
  detailContent.textContent = text(book.book_content);

  const me = getUsernameFromToken();
  const isOtherUser = book.added_by !== undefined && me !== null && book.added_by !== me;
  deleteBtn.hidden = isOtherUser;
  editBtn.hidden = isOtherUser;
}

function showBookDetail(book) {
  openedBook = book;
  fillDetail(book);
  booksListView.hidden = true;
  bookDetailView.hidden = false;
  detailContent.scrollTop = 0;
}

async function openBook(bookId) {
  try {
    const response = await authFetch(BASE_URL + "/get_book/" + bookId);

    if (response.status === 401) {
      clearTokens();
      showAuth();
      return;
    }

    if (!response.ok) {
      alert("Could not load the book (" + response.status + ")");
      return;
    }

    const book = await response.json();
    showBookDetail(book);
  } catch (error) {
    alert("Error");
  }
}

function openSearchModal() {
  searchForm.reset();
  idForm.reset();
  searchError.textContent = "";
  idError.textContent = "";
  searchModal.hidden = false;
  searchName.focus();
}

function closeSearchModal() {
  searchModal.hidden = true;
}

async function submitSearch(event) {
  event.preventDefault();

  const body = {};
  const name = searchName.value.trim();
  const writer = searchWriter.value.trim();
  const genre = searchGenre.value.trim();

  if (name) {
    body.book_name = name;
  }
  if (writer) {
    body.writer = writer;
  }
  if (genre) {
    body.genre = genre;
  }

  if (Object.keys(body).length === 0) {
    searchError.textContent = "Fill at least one field";
    return;
  }

  searchError.textContent = "";
  searchSubmit.disabled = true;

  try {
    const result = await fetchSearch(body);

    if (result === null) {
      return;
    }

    if (!result.ok || !Array.isArray(result.data)) {
      searchError.textContent =
        (result.data && result.data.message) || "Server error: " + result.status;
      return;
    }

    loadId++;
    lastSearchBody = body;
    setSearchUI(true, result.data.length);
    renderBooks(result.data);
    closeSearchModal();
  } catch (error) {
    searchError.textContent = "Error searching the books";
  } finally {
    searchSubmit.disabled = false;
  }
}

async function submitIdSearch(event) {
  event.preventDefault();

  if (idSearchInput.value === "") {
    idError.textContent = "Enter a book ID";
    return;
  }

  const bookId = Number(idSearchInput.value);

  if (!Number.isInteger(bookId) || bookId < 0) {
    idError.textContent = "Book ID must be a whole number";
    return;
  }

  idError.textContent = "";
  idSearchSubmit.disabled = true;

  try {
    const response = await authFetch(BASE_URL + "/get_book/" + bookId);

    if (response.status === 401) {
      clearTokens();
      showAuth();
      return;
    }

    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      idError.textContent = (data && data.message) || "Server error: " + response.status;
      return;
    }

    closeSearchModal();
    showBookDetail(data);
  } catch (error) {
    idError.textContent = "Error searching the book";
  } finally {
    idSearchSubmit.disabled = false;
  }
}

function openDeleteModal() {
  if (!openedBook) {
    return;
  }

  deleteText.textContent =
    "Are you sure you want to delete \u201c" + openedBook.book_name + "\u201d? This can not be undone.";
  deleteError.textContent = "";
  deleteModal.hidden = false;
  deleteCancel.focus();
}

function closeDeleteModal() {
  deleteModal.hidden = true;
}

async function deleteBook() {
  if (!openedBook) {
    return;
  }

  deleteError.textContent = "";
  deleteConfirm.disabled = true;

  try {
    const response = await authFetch(BASE_URL + "/delete_book/" + openedBook.book_id, {
      method: "DELETE"
    });

    if (response.status === 401) {
      clearTokens();
      showAuth();
      return;
    }

    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      deleteError.textContent = data.message || "Server error: " + response.status;
      return;
    }

    closeDeleteModal();
    showBooksList();
    showToast("Book deleted");

    if (searchActive) {
      await refreshSearch();
    } else {
      const result = await loadBooks(currentPage);
      if (result && result.book.length === 0 && currentPage > 1) {
        await loadBooks(Math.max(result.pagination.total_pages, 1));
      }
    }
  } catch (error) {
    deleteError.textContent = "Error deleting the book";
  } finally {
    deleteConfirm.disabled = false;
  }
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function dateForInput(value) {
  const text = String(value === undefined || value === null ? "" : value);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : "";
}

function openAddModal() {
  formMode = "add";
  addForm.reset();
  formTitle.textContent = "Add book";
  addSubmit.textContent = "Add book";
  addId.disabled = false;
  addCreated.value = todayString();
  addError.textContent = "";
  addModal.hidden = false;
  addName.focus();
}

function openEditModal() {
  if (!openedBook) {
    return;
  }

  formMode = "edit";
  addForm.reset();
  formTitle.textContent = "Edit book";
  addSubmit.textContent = "Save changes";

  addName.value = openedBook.book_name || "";
  addWriter.value = openedBook.writer || "";
  addGenre.value = openedBook.genre || "";
  addId.value = openedBook.book_id;
  addId.disabled = true;
  addYear.value = openedBook.published_year;
  addRating.value = openedBook.rating;
  addCreated.value = dateForInput(openedBook.created_at);
  addContent.value = openedBook.book_content || "";

  addError.textContent = "";
  addModal.hidden = false;
  addName.focus();
}

function closeAddModal() {
  addModal.hidden = true;
}

async function submitBook(event) {
  event.preventDefault();

  const isEdit = formMode === "edit";

  if (isEdit && !openedBook) {
    return;
  }

  const name = addName.value.trim();
  const writer = addWriter.value.trim();
  const genre = addGenre.value.trim();
  const content = addContent.value.trim();
  const created = addCreated.value;
  const bookId = isEdit ? openedBook.book_id : Number(addId.value);
  const year = Number(addYear.value);
  const rating = Number(addRating.value);
  const currentYear = new Date().getFullYear();

  if (
    !name || !writer || !genre || !content || !created ||
    (!isEdit && addId.value === "") || addYear.value === "" || addRating.value === ""
  ) {
    addError.textContent = "Fill all fields";
    return;
  }

  if (!Number.isInteger(bookId) || bookId < 0) {
    addError.textContent = "Book ID must be a whole number";
    return;
  }

  if (!Number.isInteger(year) || year < 0 || year > currentYear) {
    addError.textContent = "Published year must be between 0 and " + currentYear;
    return;
  }

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    addError.textContent = "Rating must be a whole number from 0 to 5";
    return;
  }

  addError.textContent = "";
  addSubmit.disabled = true;

  const url = isEdit
    ? BASE_URL + "/update_book/" + bookId
    : BASE_URL + "/add_book";

  try {
    const response = await authFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_name: name,
        book_content: content,
        book_id: bookId,
        writer: writer,
        published_year: year,
        rating: rating,
        genre: genre,
        created_at: created
      })
    });

    if (response.status === 401) {
      clearTokens();
      showAuth();
      return;
    }

    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      addError.textContent = data.message || "Server error: " + response.status;
      return;
    }

    closeAddModal();

    if (isEdit) {
      showToast("Book updated");
      await openBook(bookId);
      refreshList();
    } else {
      showToast("Book added");
      if (searchActive) {
        await exitSearch();
      } else {
        await loadBooks(currentPage);
      }
    }
  } catch (error) {
    addError.textContent = "Error sending the book";
  } finally {
    addSubmit.disabled = false;
  }
}

function setMode(newMode) {
  mode = newMode;

  if (mode === "signup") {
    document.title = "Sign Up";
    submitBtn.textContent = "Sign Up";
    switchLabel.textContent = "Do you have an account?";
    passwordInput.autocomplete = "new-password";
  } else {
    document.title = "Login";
    submitBtn.textContent = "Login";
    switchLabel.textContent = "Don't have an account?";
    passwordInput.autocomplete = "current-password";
  }
}

async function submit() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    alert("Fill both fields");
    return;
  }

  try {
    const response = await fetch(urls[mode], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Server error: " + response.status);
      return;
    }

    if (mode === "login") {
      saveTokens(data.token, data.refresh_token);
      passwordInput.value = "";
      currentPage = 1;
      await showDashboard();
    } else {
      alert("Account created");
      setMode("login");
    }
  } catch (error) {
    alert("Error");
  }
}

submitBtn.addEventListener("click", submit);

switchLink.addEventListener("click", function (event) {
  event.preventDefault();
  setMode(mode === "signup" ? "login" : "signup");
});

navItems.forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.preventDefault();
    showSection(item.dataset.section);
  });
});

prevBtn.addEventListener("click", function () {
  if (currentPage > 1) {
    loadBooks(currentPage - 1);
  }
});

nextBtn.addEventListener("click", function () {
  if (currentPage < totalPages) {
    loadBooks(currentPage + 1);
  }
});

backBtn.addEventListener("click", showBooksList);

addBtn.addEventListener("click", openAddModal);
editBtn.addEventListener("click", openEditModal);
addCancel.addEventListener("click", closeAddModal);
addForm.addEventListener("submit", submitBook);

searchBtn.addEventListener("click", openSearchModal);
searchCancel.addEventListener("click", closeSearchModal);
searchForm.addEventListener("submit", submitSearch);
idForm.addEventListener("submit", submitIdSearch);
clearSearchBtn.addEventListener("click", exitSearch);

deleteBtn.addEventListener("click", openDeleteModal);
deleteCancel.addEventListener("click", closeDeleteModal);
deleteConfirm.addEventListener("click", deleteBook);

addModal.addEventListener("click", function (event) {
  if (event.target === addModal) {
    closeAddModal();
  }
});

searchModal.addEventListener("click", function (event) {
  if (event.target === searchModal) {
    closeSearchModal();
  }
});

deleteModal.addEventListener("click", function (event) {
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") {
    return;
  }

  if (!addModal.hidden) {
    closeAddModal();
  }

  if (!searchModal.hidden) {
    closeSearchModal();
  }

  if (!deleteModal.hidden) {
    closeDeleteModal();
  }
});

logoutBtn.addEventListener("click", function () {
  clearTokens();
  currentPage = 1;
  showAuth();
});

if (localStorage.getItem("token")) {
  showDashboard();
}