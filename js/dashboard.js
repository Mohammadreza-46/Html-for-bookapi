import { BASE_URL } from "./config.js";
import { state } from "./state.js";
import { apiRequest, getUsernameFromToken } from "./api.js";
import { isBookSection, enterBooksSection } from "./books.js";
import {
  navItems, panels, dashboardMessage, statUsername, statMyBooks,
  statRating, statGenres, statAllBooks, statsError
} from "./dom.js";

const SECTION_PANEL = {
  dashboard: "dashboard",
  books: "books",
  mybooks: "books"
};

function statText(value) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

export function setWelcomeMessage(text) {
  dashboardMessage.textContent = text;
}

async function loadDashboard() {
  const myLoad = ++state.dashboardLoadId;

  statsError.textContent = "";
  [statUsername, statMyBooks, statRating, statGenres, statAllBooks].forEach(function (element) {
    element.textContent = "-";
  });

  try {
    const results = await Promise.all([
      apiRequest(BASE_URL + "/me"),
      apiRequest(BASE_URL + "/stats"),
      apiRequest(BASE_URL + "/get_all_book?page=1&per_page=1")
    ]);

    if (myLoad !== state.dashboardLoadId) {
      return;
    }

    if (results.some(function (result) { return result === null; })) {
      return;
    }

    const me = results[0];
    const stats = results[1];
    const allBooks = results[2];

    if (me.ok) {
      statUsername.textContent = statText(me.data.username || getUsernameFromToken());
    }

    if (stats.ok) {
      statMyBooks.textContent = statText(stats.data.total_books);
      statRating.textContent =
        stats.data.average_rating === null || stats.data.average_rating === undefined
          ? "-"
          : stats.data.average_rating + " / 5";
      statGenres.textContent = statText(stats.data.distinct_genres);
    }

    if (allBooks.ok && allBooks.data.pagination) {
      statAllBooks.textContent = statText(allBooks.data.pagination.total);
    }

    if (!me.ok || !stats.ok || !allBooks.ok) {
      statsError.textContent = "Could not load some statistics";
    }
  } catch (error) {
    if (myLoad === state.dashboardLoadId) {
      statsError.textContent = "Could not connect to the server";
    }
  }
}

export function showSection(name) {
  state.currentSection = name;

  navItems.forEach(function (item) {
    item.classList.toggle("active", item.dataset.section === name);
  });

  panels.forEach(function (panel) {
    panel.hidden = panel.dataset.panel !== SECTION_PANEL[name];
  });

  if (isBookSection(name)) {
    enterBooksSection(name);
  }

  if (name === "dashboard") {
    loadDashboard();
  }
}
