const API_BASE = window.location.hostname === "localhost" ? "http://localhost:3000" : "";

export const post = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
};

export const get = async (path, params = {}) => {
  // Build query string from params
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_BASE}${path}?${queryString}` : `${API_BASE}${path}`;

  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
};

export const del = async (path) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
};
