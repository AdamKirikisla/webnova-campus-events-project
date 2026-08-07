const regCount = document.querySelector('#reg-count');
const tbody = document.querySelector('#registrations-tbody');
const searchInput = document.querySelector('#search-student');
const eventFilter = document.querySelector('#event-filter');
const statusFilter = document.querySelector('#status-filter');

const categoryMap = {
  academic: 'Academic Workshops',
  career: 'Career Events',
  club: 'Club Activities',
  sports: 'Sports Events',
  volonteering: 'Volunteering Events',
  social: 'Social Events',
  guest: 'Guest Lectures',
  networking: 'Networking Events',
};

// Finding an event's category from a registration
function categoryOf(registry) {
  const event = fakeEvents.find((e) => e.event_id === registry.event_id); // returns the first element in the provided array that satisfies
  return event ? event.category : '';
}

// Checks if this event's date is today or later
function isEventFuture(event) {
  const eventDate = new Date(event.event_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

// Attendance is never stored — it's always derived from status + event date
// Returns the text shown in the "Attendance Status" column
function computeAttendance(registry, event) {
  if (!event) return 'Unknown';

  if (registry.status === 'cancelled') return 'N/A'; // withdrew, so attendance never applies

  if (isEventFuture(event)) return 'Not yet'; // event hasn't happened, impossible to know

  if (registry.status === 'attended') return 'Yes';
  if (registry.status === 'missed') return 'No';

  return 'Not recorded'; // past event, admin hasn't marked the outcome yet
}

// Builds what goes inside the "Registration Status" cell
// The admin's only job here is marking who showed up, so that's the only thing editable
function statusCell(registry, event) {
  // Cancelled comes from the student dropping or the event being cancelled — not editable here
  if (registry.status === 'cancelled') {
    return `<span class="status-badge">Cancelled</span>`;
  }

  // Future event -> nothing to mark yet, read-only
  if (!event || isEventFuture(event)) {
    return `<span class="status-badge">Registered</span>`;
  }

  // Past event -> admin marks Attended or Missed
  return `
    <select class="status-select" data-role="status">
      <option value="" disabled ${registry.status === 'registered' ? 'selected' : ''}>Select outcome</option>
      <option value="attended" ${registry.status === 'attended' ? 'selected' : ''}>Attended</option>
      <option value="missed" ${registry.status === 'missed' ? 'selected' : ''}>Missed</option>
    </select>
  `;
}

// read the filters, figure out which registrations match, and rebuild the table
function renderRows() {
  if (!tbody) {
    console.error('Registrations table not found.');
    return;
  }

  const searchVal = searchInput.value.trim().toLowerCase();
  const eventVal = eventFilter.value;
  const statusVal = statusFilter.value;

  // returns new array
  const filtered = fakeRegistrations.filter((registry) => {
    const matchesSearch = !searchVal || registry.user_id.toLowerCase().includes(searchVal);
    const matchesCategory = eventVal === 'all' || categoryOf(registry) === categoryMap[eventVal];
    const matchesStatus = statusVal === 'all' || registry.status === statusVal;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  regCount.textContent = `${filtered.length} registration${filtered.length === 1 ? '' : 's'}`;

  tbody.innerHTML = ''; // reset

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No registrations match these filters.</td></tr>';
    return;
  }

  for (const registry of filtered) {
    const row = document.createElement('tr');
    row.dataset.regId = registry.registration_id;

    const event = fakeEvents.find((e) => e.event_id === registry.event_id); // needed to check future/past

    row.innerHTML = `
    <td><strong>${registry.user_id}</strong></td>
    <td class="muted-cell">E${registry.event_id}</td>
    <td>${registry.event_name}</td>
    <td>${registry.registration_date}</td>
    <td>${statusCell(registry, event)}</td>
    <td><span class="status-badge">${computeAttendance(registry, event)}</span></td>
    <td class="modifiers">
      <button class="btn btn-primary delete">Remove</button>
    </td>
  `;

    tbody.appendChild(row);
  }
}
// Listening for changes, run renderRows
searchInput.addEventListener('input', renderRows);
eventFilter.addEventListener('change', renderRows);
statusFilter.addEventListener('change', renderRows);

// Admin marks attendance — only fires on past-event rows, since those are the only ones with a <select>
tbody.addEventListener('change', (e) => {
  if (e.target.dataset.role !== 'status') return;

  const row = e.target.closest('tr');
  const regId = Number(row.dataset.regId);

  const registry = fakeRegistrations.find((r) => r.registration_id === regId);
  registry.status = e.target.value; // 'attended' or 'missed' only, that's all the dropdown offers

  renderRows(); // attendance column recalculates itself from the new status
});

// Delete logic
tbody.addEventListener('click', (e) => {
  if (!e.target.classList.contains('delete')) return; // element clicked

  const row = e.target.closest('tr');
  const regId = Number(row.dataset.regId);
  const index = fakeRegistrations.findIndex((r) => r.registration_id === regId); //search the real data array
  if (index !== -1) fakeRegistrations.splice(index, 1); // at position index, remove one element, so itself

  renderRows(); // when clicked again
});

renderRows(); // draw the table once when the page first loads
