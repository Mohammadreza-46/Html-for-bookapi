import { BASE_URL } from "../config.js";
import { state } from "../state.js";
import { apiRequest, getUsernameFromToken } from "../api.js";
import { showToast } from "../ui.js";
import {
  booksListView, bookDetailView, editBtn, deleteBtn,
  detailTitle, detailId, detailWriter, detailGenre, detailYear, detailRating,
  detailAddedBy, detailCreated, detailAdded, detailContent
} from "../dom.js";

export function showBooksList() {
  bookDetailView.hidden = true;
  booksListView.hidden = false;
  state.openedBook = null;
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
  detailRating.textContent = book.rating == null ? "-" : book.rating + "/5";
  detailAddedBy.textContent = text(book.added_by);
  detailCreated.textContent = text(book.created_at);
  detailAdded.textContent = text(book.added_at);
  detailContent.textContent = text(book.book_content);

  const me = getUsernameFromToken();
  const isOtherUser = book.added_by !== undefined && me !== null && book.added_by !== me;
  deleteBtn.hidden = isOtherUser;
  editBtn.hidden = isOtherUser;
}

export function showBookDetail(book) {
  state.openedBook = book;
  fillDetail(book);
  booksListView.hidden = true;
  bookDetailView.hidden = false;
  detailContent.scrollTop = 0;
}

export async function openBook(bookId) {
  try {
    const result = await apiRequest(BASE_URL + "/get_book/" + bookId);

    if (result === null) {
      return;
    }

    if (!result.ok) {
      showToast("Could not load the book (" + result.status + ")");
      return;
    }

    showBookDetail(result.data);
  } catch (error) {
    showToast("Could not connect to the server");
  }
}
