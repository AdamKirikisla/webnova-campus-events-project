const tbody = document.querySelector('#registrations-tbody');
const regCount = document.querySelector('#reg-count');

// STEP 1: fetch real registrations from the backend
async function loadRegistrations() {
  try {
    const response = await fetch('/registrations');

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const registrations = await response.json();

    regCount.textContent = `${registrations.length} registrations`;
    tbody.innerHTML = '';

    for (let reg of registrations) {
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
  } catch (error) {
    console.log('Something went wrong:', error);
    tbody.innerHTML = '<tr><td colspan="9">Could not load registrations.</td></tr>';
  }
}

loadRegistrations();
