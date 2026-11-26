import { setUnauthorizedHandler } from "./api.js";
import { showAuth, showDashboard, toggleMode, submitAuth, logout } from "./js/auth.js";
import { showSection } from "./dashboard.js";
import { loadBooks, exitSearch, prevPage, nextPage } from "./books.js";
import { showBooksList } from "./js/book-detail.js";
import {
  openSearchModal, closeSearchModal, submitSearch, submitIdSearch,
  openPasswordModal, closePasswordModal, submitPassword
} from "./modals.js";
import {
  openAddModal, openEditModal, closeAddModal, submitBook,
  openDeleteModal, closeDeleteModal, deleteBook
} from "./js/book-actions.js";
import {
  authForm, switchLink, logoutBtn, navItems,
  genreFilter, ratingFilter, sortFilter, prevBtn, nextBtn, backBtn,
  addBtn, editBtn, deleteBtn, searchBtn, clearSearchBtn, passwordBtn,
  addModal, addForm, addCancel,
  searchModal, searchForm, searchCancel, idForm,
  passwordModal, passwordForm, passwordCancel,
  deleteModal, deleteCancel, deleteConfirm
} from "./dom.js";

setUnauthorizedHandler(showAuth);

authForm.addEventListener("submit", submitAuth);

switchLink.addEventListener("click", function (event) {
  event.preventDefault();
  toggleMode();
});

navItems.forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.preventDefault();
    showSection(item.dataset.section);
  });
});

[genreFilter, ratingFilter, sortFilter].forEach(function (select) {
  select.addEventListener("change", function () {
    loadBooks(1);
  });
});

prevBtn.addEventListener("click", prevPage);
nextBtn.addEventListener("click", nextPage);
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

passwordBtn.addEventListener("click", openPasswordModal);
passwordCancel.addEventListener("click", closePasswordModal);
passwordForm.addEventListener("submit", submitPassword);

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

passwordModal.addEventListener("click", function (event) {
  if (event.target === passwordModal) {
    closePasswordModal();
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

  if (!passwordModal.hidden) {
    closePasswordModal();
  }

  if (!deleteModal.hidden) {
    closeDeleteModal();
  }
});

logoutBtn.addEventListener("click", logout);

if (localStorage.getItem("token")) {
  showDashboard();
}
