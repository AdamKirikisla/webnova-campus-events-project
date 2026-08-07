// add data to tbody
const tbody = document.querySelector('#registrations-tbody');

if (!tbody) {
  console.error('Registrations table not found.');
} else {
  for (const registry of fakeRegistrations) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td><strong>${registry.user_id}</strong></td>
      <td class="muted-cell">E${registry.event_id}</td>
      <td>${registry.event_name}</td>
      <td>${registry.registration_date}</td>
      <td>${registry.status}</td>
      <td>${registry.attended}</td>
      <td class="modifiers">
        <button class="btn btn-outline edit">Edit</button>
        <button class="btn btn-primary delete">Remove</button>
      </td>
    `;

    tbody.appendChild(row);
  }
}
// Delete button logic
const deleteButtons = document.querySelectorAll('.delete');
for (let btn of deleteButtons) {
  btn.addEventListener('click', () => btn.closest('tr').remove());
}
