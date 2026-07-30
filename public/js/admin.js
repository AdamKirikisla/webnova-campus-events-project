// This code is for managing/ editing events

// So the user can't spam 'enter'
function stopEnter(e) {
  if (e.key === 'Enter') e.preventDefault();
}

// ---------------------------------------------------------------------------
// 1. BUILD CARDS FROM fakeEvents
// ---------------------------------------------------------------------------
const page = document.querySelector('.page');

for (let event of fakeEvents) {
  const card = document.createElement('div');
  card.classList.add('card');

  card.innerHTML = `
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
      <button class="cancel">Cancel Event</button>
      <button class="delete">Delete</button>
    </div>
  `;

  page.append(card);
}

// Declare button modifiers
const deleteButton = document.querySelectorAll('.delete');

// Delete Card Logic
for (let i of deleteButton) {
  i.addEventListener('click', () => i.closest('.card').remove());
}

// Edit Card Logic
const editButton = document.querySelectorAll('.edit');

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
}

// Cancel event logic

// Declare button modifiers
const cancelButton = document.querySelectorAll('.cancel');

// Cancel Event Logic
for (let i of cancelButton) {
  i.addEventListener('click', () => {
    const thisCard = i.closest('.card'); // declare ONCE, reuse below
    const statusValue = thisCard.querySelector('.status p:last-child');

    if (i.textContent === 'Cancel Event') {
      statusValue.textContent = 'Cancelled';
      statusValue.style.color = 'red';
      statusValue.style.fontWeight = 'bold';
      i.textContent = 'Reactivate';
      thisCard.classList.add('cancelledCard'); // use classList.add, not i.thisCard.add
    }
  });
}
