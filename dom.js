function $(id) {
  return document.getElementById(id);
}

export const authBox = $("auth-box");
export const dashboardBox = $("dashboard-box");
export const dashboardMessage = $("dashboard-message");
export const logoutBtn = $("logout-btn");
export const navItems = document.querySelectorAll(".nav-item");
export const panels = document.querySelectorAll("[data-panel]");

export const authForm = $("auth-form");
export const authError = $("auth-error");
export const usernameInput = $("username");
export const passwordInput = $("password");
export const submitBtn = $("submit-btn");
export const switchLabel = $("switch-label");
export const switchLink = $("switch-link");

export const statUsername = $("stat-username");
export const statMyBooks = $("stat-my-books");
export const statRating = $("stat-rating");
export const statGenres = $("stat-genres");
export const statAllBooks = $("stat-all-books");
export const statsError = $("stats-error");

export const booksTitle = $("books-title");
export const booksGrid = $("books-grid");
export const filtersBar = $("filters-bar");
export const genreFilter = $("genre-filter");
export const ratingFilter = $("rating-filter");
export const sortFilter = $("sort-filter");
export const pageBox = $("page-box");
export const pageNumber = $("page-number");
export const booksInfo = $("books-info");
export const prevBtn = $("prev-btn");
export const nextBtn = $("next-btn");
export const booksListView = $("books-list-view");
export const bookDetailView = $("book-detail-view");
export const backBtn = $("back-btn");
export const editBtn = $("edit-btn");
export const deleteBtn = $("delete-btn");

export const detailTitle = $("detail-title");
export const detailId = $("detail-id");
export const detailWriter = $("detail-writer");
export const detailGenre = $("detail-genre");
export const detailYear = $("detail-year");
export const detailRating = $("detail-rating");
export const detailAddedBy = $("detail-added-by");
export const detailCreated = $("detail-created");
export const detailAdded = $("detail-added");
export const detailContent = $("detail-content");

export const addBtn = $("add-btn");
export const addModal = $("add-modal");
export const addForm = $("add-form");
export const formTitle = $("form-title");
export const addName = $("add-name");
export const addWriter = $("add-writer");
export const addGenre = $("add-genre");
export const addYear = $("add-year");
export const addRating = $("add-rating");
export const addCreated = $("add-created");
export const addContent = $("add-content");
export const addError = $("add-error");
export const addCancel = $("add-cancel");
export const addSubmit = $("add-submit");

export const searchBtn = $("search-btn");
export const clearSearchBtn = $("clear-search-btn");
export const searchModal = $("search-modal");
export const searchForm = $("search-form");
export const searchName = $("search-name");
export const searchWriter = $("search-writer");
export const searchGenre = $("search-genre");
export const searchError = $("search-error");
export const searchCancel = $("search-cancel");
export const searchSubmit = $("search-submit");
export const idForm = $("id-form");
export const idSearchInput = $("id-search-input");
export const idSearchSubmit = $("id-search-submit");
export const idError = $("id-error");

export const passwordBtn = $("password-btn");
export const passwordModal = $("password-modal");
export const passwordForm = $("password-form");
export const oldPassword = $("old-password");
export const newPassword = $("new-password");
export const confirmPassword = $("confirm-password");
export const passwordError = $("password-error");
export const passwordCancel = $("password-cancel");
export const passwordSubmit = $("password-submit");

export const deleteModal = $("delete-modal");
export const deleteText = $("delete-text");
export const deleteError = $("delete-error");
export const deleteCancel = $("delete-cancel");
export const deleteConfirm = $("delete-confirm");

export const toast = $("toast");
