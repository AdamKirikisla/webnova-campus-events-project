// ===================================================================
// Shared API client for the WebNova frontend.
//
// Every page talks to the Express backend through this file instead of
// using the hard-coded fakeEvents array. It also normalises the data the
// database returns into the shape the pages already expect, so the
// rendering code barely has to change.
//
// The pages MUST be opened through the server (http://localhost:3000/...)
// and not by double-clicking the .html files, otherwise these relative
// request paths have no server to reach.
// ===================================================================

const WebNovaAPI = (() => {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ---------- low level fetch helper ----------
  async function request(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    // Read as text first: error responses are not always valid JSON.
    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (err) {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new Error((payload && payload.error) || `Request failed (${response.status})`);
    }
    return payload;
  }

  // ---------- formatting helpers ----------

  // MySQL DATE columns arrive as "2026-09-12T00:00:00.000Z". Building the
  // Date from the calendar part only avoids the classic off-by-one-day bug
  // in negative UTC offsets (Montreal is UTC-4/-5, so parsing the raw ISO
  // string would land on Sep 11).
  function parseEventDate(value) {
    if (!value) return null;
    const iso = typeof value === 'string' ? value : new Date(value).toISOString();
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  // Date object -> "Sep 12, 2026" (the format the pages already render)
  function formatEventDate(dateObj) {
    if (!dateObj) return '';
    return `${MONTHS[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
  }

  // MySQL TIME "10:00:00" -> "10:00 AM"
  function formatTime(value) {
    if (!value) return '';
    const [rawHours, rawMinutes] = String(value).split(':');
    const hours = Number(rawHours);
    const minutes = String(rawMinutes ?? '00').padStart(2, '0');
    if (Number.isNaN(hours)) return '';
    const period = hours < 12 ? 'AM' : 'PM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${minutes} ${period}`;
  }

  // Database row -> the event shape the pages expect.
  function normaliseEvent(row) {
    const dateObj = parseEventDate(row.event_date);
    return {
      event_id: row.event_id,
      title: row.title,
      description: row.description,
      category: row.category_name || 'Other',
      category_id: row.category_id,
      event_date: formatEventDate(dateObj),
      start_time: formatTime(row.start_time),
      end_time: formatTime(row.end_time),
      location: row.location,
      capacity: row.capacity,
      status: row.status,
      organizer_id: row.organizer_id,
      dateObj, // real Date, avoids re-parsing the formatted string
    };
  }

  function normaliseRegistration(row) {
    const dateObj = parseEventDate(row.event_date);
    return {
      registration_id: row.registration_id,
      event_id: row.event_id,
      user_id: row.user_id,
      status: row.status,
      title: row.event_title,
      event_date: formatEventDate(dateObj),
      start_time: formatTime(row.start_time),
      end_time: formatTime(row.end_time),
      location: row.location,
      dateObj,
    };
  }

  // ---------- session helpers ----------
  // The signed-in user is still kept in localStorage, but it now holds the
  // real numeric user_id coming from the Users table.
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser'));
    } catch (err) {
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }

  // Returns the user, or redirects to the login page and returns null.
  function requireLogin() {
    const user = getCurrentUser();
    if (!user || !user.user_id) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  // ---------- endpoints ----------
  async function login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async function signup(details) {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  }

  async function getUser(userId) {
    return request(`/users/${userId}`);
  }

  // Returns the updated user, which the caller should write back into the
  // session so the header/profile reflect the change immediately.
  async function updateUser(userId, details) {
    return request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    });
  }

  async function getEvents() {
    const rows = await request('/events');
    return rows.map(normaliseEvent);
  }

  async function getEvent(id) {
    return normaliseEvent(await request(`/events/${id}`));
  }

  async function getCategories() {
    return request('/categories');
  }

  async function getUserRegistrations(userId) {
    const rows = await request(`/registrations/user/${userId}`);
    return rows.map(normaliseRegistration);
  }

  async function registerForEvent(userId, eventId) {
    return request('/registrations', {
      method: 'POST',
      body: JSON.stringify({ user_id: Number(userId), event_id: Number(eventId) }),
    });
  }

  async function updateRegistration(registrationId, status) {
    return request(`/registrations/${registrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ---------- registration helpers ----------
  // A registration still "counts" unless it was cancelled.
  function isActive(registration) {
    return registration.status !== 'cancelled';
  }

  // Treated as attended when the admin marked it so, or when an active
  // registration's event date has already passed.
  function isAttended(registration, today = startOfToday()) {
    if (registration.status === 'attended') return true;
    if (registration.status === 'cancelled' || registration.status === 'missed') return false;
    return registration.dateObj !== null && registration.dateObj < today;
  }

  function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  return {
    // session
    getCurrentUser,
    setCurrentUser,
    logout,
    requireLogin,
    // auth
    login,
    signup,
    // users
    getUser,
    updateUser,
    // data
    getEvents,
    getEvent,
    getCategories,
    getUserRegistrations,
    registerForEvent,
    updateRegistration,
    // helpers
    isActive,
    isAttended,
    startOfToday,
    formatEventDate,
    formatTime,
    parseEventDate,
  };
})();
