const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Send Google ID token (credential) to backend
export async function loginWithGoogle(credential) {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }

  return res.json();
}

// Check if user is currently authenticated
export async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.authenticated ? data.user : null;
  } catch {
    return null;
  }
}

// Logout
export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  return res.json();
}

// Track a page view
export async function trackPageView() {
  try {
    await fetch(`${API_URL}/api/admin/track-view`, { method: 'POST' });
  } catch {
    // silent fail – analytics should never break the app
  }
}

// Fetch admin dashboard stats
export async function fetchAdminStats() {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch admin stats');
  }

  return res.json();
}
