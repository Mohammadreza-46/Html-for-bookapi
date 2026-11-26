import { BASE_URL } from "./config.js";
import { state } from "./state.js";
import { authFetch, readJson, saveTokens, clearTokens } from "./api.js";
import { showToast } from "./ui.js";
import { resetFilters } from "./filters.js";
import { closeAllModals } from "./modals.js";
import { showSection, setWelcomeMessage } from "./dashboard.js";
import {
  authBox, dashboardBox, authError, usernameInput, passwordInput,
  submitBtn, switchLabel
} from "./dom.js";

const urls = {
  signup: BASE_URL + "/signup",
  login: BASE_URL + "/login"
};

export function showAuth() {
  closeAllModals();
  dashboardBox.hidden = true;
  authBox.hidden = false;
  resetFilters();
}

export async function showDashboard() {
  const response = await authFetch(BASE_URL + "/dashboard");

  if (!response.ok) {
    showAuth();
    return;
  }

  const data = await response.json();
  setWelcomeMessage(data.message);
  authBox.hidden = true;
  dashboardBox.hidden = false;
  showSection("dashboard");
}

export function setMode(newMode) {
  state.mode = newMode;
  authError.textContent = "";

  if (state.mode === "signup") {
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

export function toggleMode() {
  setMode(state.mode === "signup" ? "login" : "signup");
}

export async function submitAuth(event) {
  event.preventDefault();
  authError.textContent = "";

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    authError.textContent = "Fill both fields";
    return;
  }

  submitBtn.disabled = true;

  try {
    const response = await fetch(urls[state.mode], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await readJson(response);

    if (!response.ok) {
      authError.textContent = data.message || "Server error: " + response.status;
      return;
    }

    if (state.mode === "login") {
      saveTokens(data.token, data.refresh_token);
      passwordInput.value = "";
      state.currentPage = 1;
      await showDashboard();
    } else {
      setMode("login");
      showToast("Account created, you can log in now");
    }
  } catch (error) {
    authError.textContent = "Could not connect to the server";
  } finally {
    submitBtn.disabled = false;
  }
}

export function logout() {
  clearTokens();
  state.currentPage = 1;
  showAuth();
}
