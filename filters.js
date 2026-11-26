import { BASE_URL } from "./config.js";
import { state } from "./state.js";
import { apiRequest } from "./api.js";
import { genreFilter, ratingFilter, sortFilter } from "./dom.js";

export function resetFilters() {
  genreFilter.value = "";
  ratingFilter.value = "";
  sortFilter.value = "";
}

export function hasFilters() {
  return (
    state.currentSection === "books" &&
    (genreFilter.value !== "" || ratingFilter.value !== "")
  );
}

export function addFilterParams(params) {
  if (state.currentSection !== "books") {
    return;
  }

  if (genreFilter.value) {
    params.set("genre", genreFilter.value);
  }

  if (ratingFilter.value) {
    params.set("min_rating", ratingFilter.value);
  }

  if (sortFilter.value) {
    const parts = sortFilter.value.split(":");
    params.set("sort", parts[0]);
    params.set("order", parts[1]);
  }
}

export async function loadGenres() {
  try {
    const result = await apiRequest(BASE_URL + "/genres");

    if (result === null || !result.ok || !Array.isArray(result.data.genres)) {
      return;
    }

    const selected = genreFilter.value;

    while (genreFilter.options.length > 1) {
      genreFilter.remove(1);
    }

    result.data.genres.forEach(function (genre) {
      if (!genre) {
        return;
      }

      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      genreFilter.appendChild(option);
    });

    genreFilter.value = selected;
    if (genreFilter.selectedIndex === -1) {
      genreFilter.value = "";
    }
  } catch (error) {
    return;
  }
}
