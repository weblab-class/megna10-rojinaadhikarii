// client/src/utilities.js

// REVERTED: Go back to pointing directly to port 3000. 
// This fixes the "Profile didn't load" issue.
const API_BASE = "http://localhost:3000";

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

export const get = async (path) => {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
};

// KEEP THIS: This utility handles the delete logic using the correct API_BASE
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