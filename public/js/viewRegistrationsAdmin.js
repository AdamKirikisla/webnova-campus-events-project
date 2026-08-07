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

    // Tape an invisible sticky note on this row with its registration ID,
    // so we can identify which registration to delete later when Remove is clicked
    row.dataset.regId = registry.registration_id;

    row.innerHTML = `
      <td><strong>${registry.user_id}</strong></td>
      <td class="muted-cell">E${registry.event_id}</td>
      <td>${registry.event_name}</td>
      <td>${registry.registration_date}</td>
      <td>${registry.status}</td>
      <td>${registry.attended}</td>
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

// Delete logic
tbody.addEventListener('click', (e) => {
  if (!e.target.classList.contains('delete')) return; // element clicked

  const row = e.target.closest('tr');
  const regId = Number(row.dataset.regId);
  const index = fakeRegistrations.findIndex((r) => r.registration_id === regId); //search the real data array
  if (index !== -1) fakeRegistrations.splice(index, 1); // at position index, remove one element, so itself

  renderRows(); // when clicked again
});

renderRows(); // // draw the table once when the page first loads
