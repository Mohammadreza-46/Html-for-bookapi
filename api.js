import { BASE_URL } from "./config.js";

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function saveTokens(token, refreshToken) {
  localStorage.setItem("token", token);
  localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
}

export function getUsernameFromToken() {
  try {
    const token = localStorage.getItem("token");
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)).sub;
  } catch (error) {
    return null;
  }
}

export async function refreshAccessToken() {
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

export async function authFetch(url, options = {}) {
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

export async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

export async function apiRequest(url, options = {}) {
  const response = await authFetch(url, options);

  if (response.status === 401) {
    clearTokens();
    if (onUnauthorized) {
      onUnauthorized();
    }
    return null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data: await readJson(response)
  };
}
