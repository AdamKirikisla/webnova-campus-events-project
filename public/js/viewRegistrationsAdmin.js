const tbody = document.querySelector('#registrations-tbody');
const regCount = document.querySelector('#reg-count');
const searchInput = document.querySelector('#search-student');
const eventFilter = document.querySelector('#event-filter');
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

// STEP 2: read the filters, keep only matching rows, render the table
function renderRows() {
  const searchVal = searchInput.value.trim().toLowerCase();
  const eventVal = eventFilter.value;
  const statusVal = statusFilter.value;

  const filtered = registrations.filter((reg) => {
    const matchesSearch = !searchVal || String(reg.user_id).toLowerCase().includes(searchVal);

    const categoryName = categoryNameById[reg.category_id] || '';
    const matchesCategory = eventVal === 'all' || categoryName === categoryMap[eventVal];

    const matchesStatus = statusVal === 'all' || reg.status === statusVal;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  regCount.textContent = `${filtered.length} registration${filtered.length === 1 ? '' : 's'}`;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9">No registrations match these filters.</td></tr>';
    return;
  }

  for (let reg of filtered) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${reg.registration_id}</td>
      <td><strong>${reg.user_id}</strong></td>
      <td>${reg.event_title}</td>
      <td>${reg.event_id}</td>
      <td>${reg.event_date}</td>
      <td>${reg.registration_date}</td>
      <td>${reg.status}</td>
      <td>${reg.status}</td>
      <td></td>
    `;

    tbody.appendChild(row);
  }
}

// whenever the user interacts with one of these controls, run renderRows()
searchInput.addEventListener('input', renderRows);
eventFilter.addEventListener('change', renderRows);
statusFilter.addEventListener('change', renderRows);

// Load both, then render once both are ready
async function init() {
  await Promise.all([loadRegistrations(), loadCategories()]);
  renderRows();
}

init();
