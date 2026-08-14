const tbody = document.querySelector('#registrations-tbody');
const regCount = document.querySelector('#reg-count');
const searchInput = document.querySelector('#search-student');
const eventFilter = document.querySelector('#event-filter');
// NEW: filter by one specific event
const specificEventFilter = document.querySelector('#specific-event-filter');
const statusFilter = document.querySelector('#status-filter');

// Maps the filter dropdown's short values to the real category names
// stored in the database (e.g. "academic" -> "Academic Workshops")
const categoryMap = {
  academic: 'Academic Workshops',
  career: 'Career Events',
  club: 'Club Activities',
  sports: 'Sports Events',
  cultural: 'Cultural Events',
  volunteering: 'Volunteering Events',
  social: 'Social Events',
  guest: 'Guest Lectures',
  networking: 'Networking Events',
  other: 'Other',
};

let registrations = [];
let categoryNameById = {};

// Is this event's date today or later?
function isEventFuture(reg) {
  const eventDate = new Date(reg.event_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

// What text to show in Attendance Status when it's NOT editable
function computeAttendance(reg) {
  if (reg.status === 'cancelled') return 'N/A';
  if (isEventFuture(reg)) return 'Not yet';
  if (reg.status === 'attended') return 'Yes';
  if (reg.status === 'missed') return 'No';
  return 'Not recorded';
}

// Decides what goes in the Attendance Status column:
// - cancelled or future event -> plain text, nothing to mark
// - past event, still "registered" -> a real dropdown to mark it
function attendanceCell(reg) {
  if (reg.status === 'cancelled' || isEventFuture(reg)) {
    return `<span class="status-badge">${computeAttendance(reg)}</span>`;
  }
  return `
    <select class="status-select" data-role="attendance">
      <option value="" disabled ${reg.status === 'registered' ? 'selected' : ''}>Select outcome</option>
      <option value="attended" ${reg.status === 'attended' ? 'selected' : ''}>Attended</option>
      <option value="missed" ${reg.status === 'missed' ? 'selected' : ''}>Missed</option>
    </select>
  `;
}

// STEP 1: fetch real registrations from the backend
async function loadRegistrations() {
  try {
    const response = await fetch('/registrations');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    registrations = await response.json();
  } catch (error) {
    console.log('Something went wrong:', error);
    tbody.innerHTML = '<tr><td colspan="9">Could not load registrations.</td></tr>';
  }
}

// STEP 2: fetch categories so we can match category_id -> category name
async function loadCategories() {
  try {
    const response = await fetch('/categories');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const categories = await response.json();

    for (let category of categories) {
      categoryNameById[category.category_id] = category.category_name;
    }
  } catch (error) {
    console.log('Something went wrong:', error);
  }
}

// filter by one specific event dropdown options.
function populateSpecificEventFilter() {
  const eventTitleById = {};

  for (let reg of registrations) {
    eventTitleById[reg.event_id] = reg.event_title;
  }

  for (let eventId in eventTitleById) {
    const option = document.createElement('option');
    option.value = eventId;
    option.textContent = eventTitleById[eventId];
    specificEventFilter.appendChild(option);
  }
}

// STEP 2: read the filters, keep only matching rows, render the table
function renderRows() {
  const searchVal = searchInput.value.trim();
  const eventVal = eventFilter.value;
  const specificEventVal = specificEventFilter.value;
  const statusVal = statusFilter.value;

  const filtered = registrations.filter((reg) => {
    const matchesSearch = !searchVal || String(reg.student_id).includes(searchVal);

    const categoryName = categoryNameById[reg.category_id] || '';
    const matchesCategory = eventVal === 'all' || categoryName === categoryMap[eventVal];

    const matchesSpecificEvent = specificEventVal === 'all' || Number(reg.event_id) === Number(specificEventVal);

    const matchesStatus = statusVal === 'all' || reg.status === statusVal;

    return matchesSearch && matchesCategory && matchesSpecificEvent && matchesStatus;
  });

  regCount.textContent = `${filtered.length} registration${filtered.length === 1 ? '' : 's'}`;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9">No registrations match these filters.</td></tr>';
    return;
  }

  for (let reg of filtered) {
    const row = document.createElement('tr');
    row.dataset.regId = reg.registration_id;

    row.innerHTML = `
      <td>${reg.registration_id}</td>
      <td><strong>${reg.student_id}</strong></td>
      <td>${reg.event_title}</td>
      <td>${reg.event_id}</td>
      <td>${reg.event_date}</td>
      <td>${reg.registration_date}</td>
      <td>${reg.status}</td>
      <td>${attendanceCell(reg)}</td>
      <td></td>
    `;

    tbody.appendChild(row);
  }
}

// whenever the user interacts with one of these controls, run renderRows()
searchInput.addEventListener('input', renderRows);
eventFilter.addEventListener('change', renderRows);
specificEventFilter.addEventListener('change', renderRows);
statusFilter.addEventListener('change', renderRows);

// Admin marks attendance — fires only on the dropdown from attendanceCell()
tbody.addEventListener('change', async (e) => {
  if (e.target.dataset.role !== 'attendance') return;

  const row = e.target.closest('tr');
  const regId = row.dataset.regId;
  const newStatus = e.target.value;

  try {
    const response = await fetch(`/registrations/${regId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const reg = registrations.find((r) => r.registration_id === Number(regId));
    reg.status = newStatus;
    renderRows();
  } catch (error) {
    console.log('Something went wrong:', error);
    alert('Could not update attendance.');
  }
});

// Load both, then render once both are ready
async function init() {
  await Promise.all([loadRegistrations(), loadCategories()]);
  populateSpecificEventFilter();
  renderRows();
}

init();
