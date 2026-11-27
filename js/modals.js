import { BASE_URL } from "./config.js";
import { state } from "./state.js";
import { apiRequest } from "./api.js";
import { showToast } from "./ui.js";
import { fetchSearch, renderBooks, setSearchUI } from "./books.js";
import { showBookDetail } from "./book-detail.js";
import {
  addModal, deleteModal, searchModal, passwordModal,
  searchForm, searchName, searchWriter, searchGenre, searchError, searchSubmit,
  idForm, idSearchInput, idSearchSubmit, idError,
  passwordForm, oldPassword, newPassword, confirmPassword, passwordError, passwordSubmit
} from "./dom.js";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

export function closeAllModals() {
  addModal.hidden = true;
  deleteModal.hidden = true;
  searchModal.hidden = true;
  passwordModal.hidden = true;
}

export function openSearchModal() {
  searchForm.reset();
  idForm.reset();
  searchError.textContent = "";
  idError.textContent = "";
  searchModal.hidden = false;
  searchName.focus();
}

export function closeSearchModal() {
  searchModal.hidden = true;
}

export async function submitSearch(event) {
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
      searchError.textContent = result.data.message || "Server error: " + result.status;
      return;
    }

    state.loadId++;
    state.lastSearchBody = body;
    setSearchUI(true, result.data.length);
    renderBooks(result.data);
    closeSearchModal();
  } catch (error) {
    searchError.textContent = "Error searching the books";
  } finally {
    searchSubmit.disabled = false;
  }
}

export async function submitIdSearch(event) {
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
    const result = await apiRequest(BASE_URL + "/get_book/" + bookId);

    if (result === null) {
      return;
    }

    if (!result.ok) {
      idError.textContent = result.data.message || "Server error: " + result.status;
      return;
    }

    closeSearchModal();
    showBookDetail(result.data);
  } catch (error) {
    idError.textContent = "Error searching the book";
  } finally {
    idSearchSubmit.disabled = false;
  }
}

export function openPasswordModal() {
  passwordForm.reset();
  passwordError.textContent = "";
  passwordModal.hidden = false;
  oldPassword.focus();
}

export function closePasswordModal() {
  passwordModal.hidden = true;
  passwordForm.reset();
}

export async function submitPassword(event) {
  event.preventDefault();

  const oldValue = oldPassword.value;
  const newValue = newPassword.value;
  const confirmValue = confirmPassword.value;

  if (!oldValue || !newValue || !confirmValue) {
    passwordError.textContent = "Fill all fields";
    return;
  }

  if (newValue.length < MIN_PASSWORD_LENGTH) {
    passwordError.textContent =
      "New password must be at least " + MIN_PASSWORD_LENGTH + " characters";
    return;
  }

  if (new TextEncoder().encode(newValue).length > MAX_PASSWORD_BYTES) {
    passwordError.textContent = "New password is too long (max " + MAX_PASSWORD_BYTES + " bytes)";
    return;
  }

  if (newValue !== confirmValue) {
    passwordError.textContent = "New passwords do not match";
    return;
  }

  if (newValue === oldValue) {
    passwordError.textContent = "New password must be different from the current one";
    return;
  }

  passwordError.textContent = "";
  passwordSubmit.disabled = true;

  try {
    const result = await apiRequest(BASE_URL + "/change_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_password: oldValue,
        new_password: newValue
      })
    });

    if (result === null) {
      return;
    }

    if (!result.ok) {
      passwordError.textContent = result.data.message || "Server error: " + result.status;
      return;
    }

    closePasswordModal();
    showToast("Password changed");
  } catch (error) {
    passwordError.textContent = "Error changing the password";
  } finally {
    passwordSubmit.disabled = false;
  }
}
