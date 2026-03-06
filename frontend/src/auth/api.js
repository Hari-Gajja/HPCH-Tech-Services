// In production builds, always use relative URLs (Netlify proxy handles routing to backend).
// In dev, use the local backend URL.
const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') : '';

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

// Fetch current discount (public)
export async function fetchDiscount() {
  try {
    const res = await fetch(`${API_URL}/api/admin/discount`);
    if (!res.ok) return { percentage: 0, active: false, note: '' };
    const data = await res.json();
    return data.discount;
  } catch {
    return { percentage: 0, active: false, note: '' };
  }
}

// Set discount (admin only)
export async function setDiscount(percentage, note) {
  const res = await fetch(`${API_URL}/api/admin/discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ percentage, note }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to set discount');
  }

  return res.json();
}

// Upload student ID image
export async function uploadStudentId(file) {
  const formData = new FormData();
  formData.append('studentId', file);

  const res = await fetch(`${API_URL}/api/admin/upload-student-id`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload image');
  }

  return res.json();
}

// Submit student discount request
export async function submitStudentRequest(data) {
  const res = await fetch(`${API_URL}/api/admin/student-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit request');
  }

  return res.json();
}

// Fetch student requests (admin only)
export async function fetchStudentRequests() {
  const res = await fetch(`${API_URL}/api/admin/student-requests`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch student requests');
  }

  return res.json();
}

// Delete student ID image (admin only)
export async function deleteStudentId(id) {
  const res = await fetch(`${API_URL}/api/admin/student-request/${encodeURIComponent(id)}/image`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete student ID');
  }

  return res.json();
}

// Delete entire student request (admin only)
export async function deleteStudentRequest(id) {
  const res = await fetch(`${API_URL}/api/admin/student-request/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete request');
  }

  return res.json();
}

// Update student request status (admin only)
export async function updateStudentRequestStatus(id, status) {
  const res = await fetch(`${API_URL}/api/admin/student-request/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update request');
  }

  return res.json();
}

// Remove all student discounts (admin only)
export async function removeAllStudentDiscounts() {
  const res = await fetch(`${API_URL}/api/admin/student-discounts`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to remove student discounts');
  }

  return res.json();
}
