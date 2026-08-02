// Prevent the Enter key from causing unintended line breaks or form submissions during edits
function stopEnter(e) {
  if (e.key === 'Enter') e.preventDefault();
}

const page = document.querySelector('.page');
// Loop through the mock data array to dynamically generate and append event cards to the page
for (let event of fakeEvents) {
  const card = document.createElement('div');
  card.classList.add('card');

  /*const isCancelled = event.status === 'cancelled';*/

  /*card.innerHTML = `
    <h2>${event.title}</h2>
    <div class="card-content">
      <div class="description"><p>Description</p><p>${event.description}</p></div>
      <div class="category"><p>Category</p><p>${event.category}</p></div>
      <div class="event_date"><p>Date</p><p>${event.event_date}</p></div>
      <div class="start_time"><p>Start Time</p><p>${event.start_time}</p></div>
      <div class="end_time"><p>End Time</p><p>${event.end_time}</p></div>
      <div class="location"><p>Location</p><p>${event.location}</p></div>
      <div class="capacity"><p>Capacity</p><p>${event.capacity}</p></div>
      <div class="organizer_id"><p>Organizer</p><p>${event.organizer_id}</p></div>
      <div class="status"><p>Status</p><p>${event.status}</p></div>
    </div>
    <div class="modifiers">
      <button class="edit">Edit</button>
      <button class="cancel">${isCancelled ? 'Reactivate' : 'Cancel Event'}</button>
      <button class="delete">Delete</button>
    </div>
  `;*/
  //Here the diff is that div in card-header have row for better styling and the buttons are now styled with btn, btn-outline, and btn-primary classes for consistent appearance.
  card.innerHTML = `
    <div class="card-header">
      <h2>${event.title}</h2>
    </div>
    <div class="card-content">
      <div class="row description"><p>Description</p><p>${event.description}</p></div>
      <div class="row category"><p>Category</p><p>${event.category}</p></div>
      <div class="row event_date"><p>Date</p><p>${event.event_date}</p></div>
      <div class="row start_time"><p>Start Time</p><p>${event.start_time}</p></div>
      <div class="row end_time"><p>End Time</p><p>${event.end_time}</p></div>
      <div class="row location"><p>Location</p><p>${event.location}</p></div>
      <div class="row capacity"><p>Capacity</p><p>${event.capacity}</p></div>
      <div class="row organizer_id"><p>Organizer</p><p>${event.organizer_id}</p></div>
      <div class="row status"><p>Status</p><p>${event.status}</p></div>
    </div>
    <div class="modifiers">
      <button class="btn btn-outline edit">Edit</button>
      <button class="btn btn-primary delete">Delete</button>
    </div>
  `;

  page.append(card);
}
// Attach click listeners to all delete buttons to permanently remove the selected card from the UI
const deleteButton = document.querySelectorAll('.delete');

for (let i of deleteButton) {
  i.addEventListener('click', () => i.closest('.card').remove());
}

// Edit Card Logic
/*const editButton = document.querySelectorAll('.edit');

// list of every class name that holds an editable value, matching the schema fields
const editableFields = [
  'description',
  'category',
  'event_date',
  'start_time',
  'end_time',
  'location',
  'capacity',
  'organizer_id',
  'status',
];

for (let i of editButton) {
  i.addEventListener('click', () => {
    const thisCard = i.closest('.card'); // parent

    if (i.textContent === 'Edit') {
      for (let fieldClass of editableFields) {
        const value = thisCard.querySelector(`.${fieldClass} p:last-child`);
        value.contentEditable = 'true';
        value.classList.add('selected');
        value.onkeydown = stopEnter;
      }

      i.textContent = 'Save';
    } else if (i.textContent === 'Save') {
      for (let fieldClass of editableFields) {
        const value = thisCard.querySelector(`.${fieldClass} p:last-child`);
        value.textContent = value.textContent; // strip any pasted HTML/markup

        value.contentEditable = false;
        value.classList.remove('selected');
        value.onkeydown = null; // remove the handler when no longer editable
      }

      i.textContent = 'Edit';
    }
  });
}*/
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

const editButton = document.querySelectorAll('.edit');

const editableFields = [
  'description',
  'category',
  'event_date',
  'start_time',
  'end_time',
  'location',
  'capacity',
  'organizer_id',
  'status',
];

for (let btn of editButton) {
  btn.addEventListener('click', () => {
    const thisCard = btn.closest('.card');
    // Switch to Edit Mode: Iterate through fields and replace static text with corresponding interactive HTML inputs (select, date, time, text)
    if (btn.textContent === 'Edit') {
      for (let fieldClass of editableFields) {
        const valueContainer = thisCard.querySelector(`.${fieldClass} p:last-child`);
        const currentValue = valueContainer.textContent.trim();
        valueContainer.classList.add('editing');

        let inputHTML = '';
        if (fieldClass === 'category') {
          inputHTML = `
            <select class="input edit-input">
              <option value="Academic Workshops" ${currentValue === 'Academic Workshops' ? 'selected' : ''}>Academic Workshops</option>
              <option value="Career Events" ${currentValue === 'Career Events' ? 'selected' : ''}>Career Events</option>
              <option value="Club Activities" ${currentValue === 'Club Activities' ? 'selected' : ''}>Club Activities</option>
              <option value="Sports Events" ${currentValue === 'Sports Events' ? 'selected' : ''}>Sports Events</option>
              <option value="Cultural Events" ${currentValue === 'Cultural Events' ? 'selected' : ''}>Cultural Events</option>
              <option value="Volunteering Events" ${currentValue === 'Volunteering Events' ? 'selected' : ''}>Volunteering Events</option>
              <option value="Social Events" ${currentValue === 'Social Events' ? 'selected' : ''}>Social Events</option>
              <option value="Guest Lectures" ${currentValue === 'Guest Lectures' ? 'selected' : ''}>Guest Lectures</option>
              <option value="Networking Events" ${currentValue === 'Networking Events' ? 'selected' : ''}>Networking Events</option>
              <option value="Other" ${currentValue === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          `;
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
      // Switch to Save Mode: Begin validation phase to ensure no fields are empty
    } else if (btn.textContent === 'Save') {
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
      // Chronological Validation: Ensure the event's end time is strictly after the start time
      const startInput = thisCard.querySelector('.start_time .edit-input');
      const endInput = thisCard.querySelector('.end_time .edit-input');

      if (startInput && endInput && startInput.value >= endInput.value) {
        startInput.style.borderColor = 'red';
        endInput.style.borderColor = 'red';
        alert('The end time must be AFTER the start time!');
        return;
      }
      // Save Phase: Extract the newly inputted values, format them appropriately, and revert the UI back to static text
      for (let fieldClass of editableFields) {
        const valueContainer = thisCard.querySelector(`.${fieldClass} p:last-child`);
        const inputEl = valueContainer.querySelector('.edit-input');

        if (inputEl) {
          let newValue = inputEl.value;
          if (inputEl.type === 'date') newValue = toDisplayDate(newValue);
          if (inputEl.type === 'time') newValue = toDisplayTime(newValue);

          valueContainer.textContent = newValue;
        }

        valueContainer.classList.remove('editing');
      }
      btn.textContent = 'Edit';
      btn.classList.add('btn-outline');
      btn.classList.remove('btn-primary');
    }
  });
}

// Cancel event logic

// Declare button modifiers
/*const cancelButton = document.querySelectorAll('.cancel');

// Cancel Event Logic
for (let i of cancelButton) {
  i.addEventListener('click', () => {
    const thisCard = i.closest('.card'); // declare ONCE, reuse below
    const statusValue = thisCard.querySelector('.status p:last-child');

    if (i.textContent === 'Cancel Event') {
      // Save current status BEFORE overwriting it
      statusValue.dataset.previousStatus = statusValue.textContent;
      statusValue.textContent = 'cancelled';
      statusValue.style.color = 'red';
      statusValue.style.fontWeight = 'bold';
      i.style.backgroundColor = '#166534';
      i.textContent = 'Reactivate';
      thisCard.classList.add('cancelledCard');
    } else if (i.textContent === 'Reactivate') {
      // Restore whatever it was before, or fall back to 'open' if none was saved
      statusValue.textContent = statusValue.dataset.previousStatus || 'open';
      statusValue.style.color = '';
      statusValue.style.fontWeight = '';
      i.style.backgroundColor = '';
      i.textContent = 'Cancel Event';
      thisCard.classList.remove('cancelledCard');
    }
  });
}*/
