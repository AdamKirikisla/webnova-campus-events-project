// Prevent the Enter key from causing unintended line breaks or form submissions during edits
function stopEnter(e) {
  if (e.key === 'Enter') e.preventDefault();
}

// STEP 4: real categories,
let categories = [];

async function loadCategories() {
  try {
    const response = await fetch('/categories');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    categories = await response.json();
  } catch (error) {
    console.log('Something went wrong:', error);
  }
}

const page = document.querySelector('.page');

// STEP 1: fetch real events from the backend instead of looping over fakeEvents
async function loadEvents() {
  try {
    const response = await fetch('/events');

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const events = await response.json();

    for (let event of events) {
      const card = document.createElement('div');
      card.classList.add('card');
      // creates an HTML attribute on that card, e.g.<div class="card" data-event-id="3">
      card.dataset.eventId = event.event_id;
      card.dataset.categoryId = event.category_id;
      card.innerHTML = `
        <div class="card-header">
          <h2>${event.title}</h2>
        </div>
        <div class="card-content">
          <div class="row event_id"><p>Event ID</p><p>${event.event_id}</p></div>
          <div class="row description"><p>Description</p><p>${event.description}</p></div>
          <div class="row category"><p>Category</p><p>${event.category_name}</p></div>
          <div class="row event_date"><p>Date</p><p>${event.event_date}</p></div>
          <div class="row start_time"><p>Start Time</p><p>${event.start_time}</p></div>
          <div class="row end_time"><p>End Time</p><p>${event.end_time}</p></div>
          <div class="row location"><p>Location</p><p>${event.location}</p></div>
          <div class="row capacity"><p>Capacity</p><p>${event.capacity}</p></div>
          <div class="row organizer_id"><p>Organizer</p><p>${event.organizer_name}</p></div>
          <div class="row status"><p>Status</p><p>${event.status}</p></div>
          <div class="row created_on"><p>Created On</p><p>${event.created_on}</p></div>
        </div>
        <div class="modifiers">
          <button class="btn btn-outline edit">Edit</button>
          <button class="btn btn-primary delete">Delete</button>
        </div>
      `;

      page.append(card);
    }
  } catch (error) {
    console.log('Something went wrong:', error);
    page.innerHTML = '<p>Could not load events.</p>';
  }
}

(async () => {
  const currentUser = await WebNovaAPI.requireLogin();
  if (!currentUser) return;
  loadCategories();
  loadEvents();
})();

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    WebNovaAPI.logout();
  });
}

// STEP 2: Delete button now calls DELETE /events/:id
page.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('delete')) return;

  const card = e.target.closest('.card');
  const eventId = card.dataset.eventId;

  if (!confirm('Delete this event? This cannot be undone.')) return;

  try {
    const response = await fetch(`/events/${eventId}`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    card.remove();
  } catch (error) {
    console.log('Something went wrong:', error);
    alert('Could not delete event.');
  }
});

// Utility functions to handle bidirectional conversion between HTML5 input values and human-readable strings
function toInputDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toISOString().split('T')[0];
  } catch (e) {
    return dateStr;
  }
}

function toDisplayDate(dateStr) {
  try {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function toInputTime(timeStr) {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let [_, hours, mins, modifier] = match;
    if (hours === '12') hours = '00';
    if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${mins}`;
  } catch (e) {
    return timeStr;
  }
}

function toDisplayTime(timeStr) {
  try {
    let [hours, mins] = timeStr.split(':');
    if (!hours) return timeStr;
    hours = parseInt(hours, 10);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${modifier}`;
  } catch (e) {
    return timeStr;
  }
}

// STEP 3: Edit / Save
const editableFields = [
  'description',
  'category',
  'event_date',
  'start_time',
  'end_time',
  'location',
  'capacity',
  'status',
];

page.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('edit')) return;

  const btn = e.target;
  const thisCard = btn.closest('.card');
  const eventId = thisCard.dataset.eventId;

  if (btn.textContent === 'Edit') {
    for (let fieldClass of editableFields) {
      const valueContainer = thisCard.querySelector(`.${fieldClass} p:last-child`);
      const currentValue = valueContainer.textContent.trim();
      valueContainer.classList.add('editing');

      let inputHTML = '';

      // Real category table
      if (fieldClass === 'category') {
        const currentCategoryId = Number(thisCard.dataset.categoryId);
        const optionsHtml = categories
          .map(
            (c) =>
              `<option value="${c.category_id}" ${c.category_id === currentCategoryId ? 'selected' : ''}>${c.category_name}</option>`
          )
          .join('');
        inputHTML = `<select class="input edit-input">${optionsHtml}</select>`;
      } else if (fieldClass === 'status') {
        inputHTML = `
          <select class="input edit-input">
            <option value="open" ${currentValue === 'open' ? 'selected' : ''}>Open</option>
            <option value="full" ${currentValue === 'full' ? 'selected' : ''}>Full</option>
            <option value="cancelled" ${currentValue === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="completed" ${currentValue === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="disabled" ${currentValue === 'disabled' ? 'selected' : ''}>Disabled</option>
          </select>
        `;
      } else if (fieldClass === 'event_date') {
        const today = new Date().toISOString().split('T')[0];
        inputHTML = `<input type="date" class="input edit-input" min="${today}" value="${toInputDate(currentValue)}">`;
      } else if (fieldClass === 'start_time' || fieldClass === 'end_time') {
        inputHTML = `<input type="time" class="input edit-input" value="${toInputTime(currentValue)}">`;
      } else if (fieldClass === 'capacity') {
        inputHTML = `<input type="number" class="input edit-input" min="1" value="${currentValue}">`;
      } else if (fieldClass === 'description') {
        inputHTML = `<textarea class="input edit-input" rows="3">${currentValue}</textarea>`;
      } else {
        inputHTML = `<input type="text" class="input edit-input" value="${currentValue}">`;
      }

      valueContainer.innerHTML = inputHTML;
    }
    btn.textContent = 'Save';
    btn.classList.remove('btn-outline');
    btn.classList.add('btn-primary');
    return;
  }

  // --- Save ---
  let isValid = true;
  const allInputs = thisCard.querySelectorAll('.edit-input');

  allInputs.forEach((input) => {
    if (input.value.trim() === '') {
      input.style.borderColor = 'red';
      isValid = false;
    } else {
      input.style.borderColor = 'var(--primary-color)';
    }
  });

  if (!isValid) {
    alert('No field can be empty.');
    return;
  }

  const startInput = thisCard.querySelector('.start_time .edit-input');
  const endInput = thisCard.querySelector('.end_time .edit-input');

  if (startInput && endInput && startInput.value >= endInput.value) {
    startInput.style.borderColor = 'red';
    endInput.style.borderColor = 'red';
    alert('The end time must be AFTER the start time!');
    return;
  }

  // Build the object the backend's PATCH /events/:id expects.
  // title isn't an editable field in this UI, so pull its current value
  // straight from the header. category_id comes from the card's dataset
  // for now (see note above) — the dropdown itself gets wired up next.
  const payload = {
    title: thisCard.querySelector('.card-header h2').textContent.trim(),
    description: thisCard.querySelector('.description .edit-input').value.trim(),
    category_id: Number(thisCard.querySelector('.category .edit-input').value),
    event_date: thisCard.querySelector('.event_date .edit-input').value,
    start_time: thisCard.querySelector('.start_time .edit-input').value,
    end_time: thisCard.querySelector('.end_time .edit-input').value,
    location: thisCard.querySelector('.location .edit-input').value.trim(),
    capacity: Number(thisCard.querySelector('.capacity .edit-input').value),
    status: thisCard.querySelector('.status .edit-input').value,
  };

  try {
    const response = await fetch(`/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.log('Something went wrong:', error);
    alert('Could not save changes.');
    return; // stay in edit mode so nothing is lost
  }

  // Save succeeded — keep the card's stored category_id in sync with
  // whatever the user just picked, so the next time Edit is clicked the
  // dropdown pre-selects the right option.
  thisCard.dataset.categoryId = payload.category_id;

  // Only revert the fields back to plain text once the save succeeded.
  for (let fieldClass of editableFields) {
    const valueContainer = thisCard.querySelector(`.${fieldClass} p:last-child`);
    const inputEl = valueContainer.querySelector('.edit-input');

    if (inputEl) {
      let newValue = inputEl.value;
      if (inputEl.type === 'date') newValue = toDisplayDate(newValue);
      if (inputEl.type === 'time') newValue = toDisplayTime(newValue);
      if (fieldClass === 'category') {
        const chosen = categories.find((c) => c.category_id === Number(newValue));
        newValue = chosen ? chosen.category_name : newValue;
      }

      valueContainer.textContent = newValue;
    }

    valueContainer.classList.remove('editing');
  }
  btn.textContent = 'Edit';
  btn.classList.add('btn-outline');
  btn.classList.remove('btn-primary');
});
