import { BASE_URL } from "./config.js";
import { state } from "./state.js";
import { apiRequest } from "./api.js";
import { showToast } from "./ui.js";
import { loadGenres } from "./filters.js";
import { showBooksList, openBook } from "./book-detail.js";
import { loadBooks, refreshList, refreshSearch, exitSearch } from "./books.js";
import {
  addModal, addForm, formTitle, addName, addWriter, addGenre, addYear,
  addRating, addCreated, addContent, addError, addSubmit,
  deleteModal, deleteText, deleteError, deleteCancel, deleteConfirm
} from "./dom.js";

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

export function openAddModal() {
  state.formMode = "add";
  addForm.reset();
  formTitle.textContent = "Add book";
  addSubmit.textContent = "Add book";
  addCreated.value = todayString();
  addError.textContent = "";
  addModal.hidden = false;
  addName.focus();
}

export function openEditModal() {
  const book = state.openedBook;
  if (!book) {
    return;
  }

  state.formMode = "edit";
  addForm.reset();
  formTitle.textContent = "Edit book";
  addSubmit.textContent = "Save changes";

  addName.value = book.book_name || "";
  addWriter.value = book.writer || "";
  addGenre.value = book.genre || "";
  addYear.value = book.published_year;
  addRating.value = book.rating;
  addCreated.value = dateForInput(book.created_at);
  addContent.value = book.book_content || "";

  addError.textContent = "";
  addModal.hidden = false;
  addName.focus();
}

export function closeAddModal() {
  addModal.hidden = true;
}

export async function submitBook(event) {
  event.preventDefault();

  const isEdit = state.formMode === "edit";

  if (isEdit && !state.openedBook) {
    return;
  }

  const editId = isEdit ? state.openedBook.book_id : null;
  const name = addName.value.trim();
  const writer = addWriter.value.trim();
  const genre = addGenre.value.trim();
  const content = addContent.value.trim();
  const created = addCreated.value;
  const year = Number(addYear.value);
  const rating = Number(addRating.value);
  const currentYear = new Date().getFullYear();

  if (
    !name || !writer || !genre || !content || !created ||
    addYear.value === "" || addRating.value === ""
  ) {
    addError.textContent = "Fill all fields";
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

  const payload = {
    book_name: name,
    book_content: content,
    writer: writer,
    published_year: year,
    rating: rating,
    genre: genre,
    created_at: created
  };

  if (isEdit) {
    payload.book_id = editId;
  }

  const url = isEdit
    ? BASE_URL + "/update_book/" + editId
    : BASE_URL + "/add_book";

  try {
    const result = await apiRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (result === null) {
      return;
    }

    if (!result.ok) {
      addError.textContent = result.data.message || "Server error: " + result.status;
      return;
    }

    closeAddModal();
    await loadGenres();

    if (isEdit) {
      showToast("Book updated");
      await openBook(editId);
      refreshList();
    } else {
      showToast("Book added");
      if (state.searchActive) {
        await exitSearch();
      } else {
        await loadBooks(state.currentPage);
      }
    }
  } catch (error) {
    addError.textContent = "Error sending the book";
  } finally {
    addSubmit.disabled = false;
  }
}

export function openDeleteModal() {
  if (!state.openedBook) {
    return;
  }

  deleteText.textContent =
    "Are you sure you want to delete \u201c" + state.openedBook.book_name + "\u201d? This can not be undone.";
  deleteError.textContent = "";
  deleteModal.hidden = false;
  deleteCancel.focus();
}

export function closeDeleteModal() {
  deleteModal.hidden = true;
}

export async function deleteBook() {
  if (!state.openedBook) {
    return;
  }

  deleteError.textContent = "";
  deleteConfirm.disabled = true;

  try {
    const result = await apiRequest(BASE_URL + "/delete_book/" + state.openedBook.book_id, {
      method: "DELETE"
    });

    if (result === null) {
      return;
    }

    if (!result.ok) {
      deleteError.textContent = result.data.message || "Server error: " + result.status;
      return;
    }

    closeDeleteModal();
    showBooksList();
    showToast("Book deleted");
    await loadGenres();

    if (state.searchActive) {
      await refreshSearch();
    } else {
      const data = await loadBooks(state.currentPage);
      if (data && data.book.length === 0 && state.currentPage > 1) {
        await loadBooks(Math.max(data.pagination.total_pages, 1));
      }
    }
  } catch (error) {
    deleteError.textContent = "Error deleting the book";
  } finally {
    deleteConfirm.disabled = false;
  }
}
