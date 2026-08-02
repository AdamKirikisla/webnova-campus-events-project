const forms = document.querySelector('.forms');
const input = document.querySelectorAll('.input');
// Restrict the date input minimum value to today to prevent scheduling events in the past
const dateInput = document.querySelector('input[name="event_date"]');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}
// Intercept form submission to handle data validation and dynamic object creation without reloading
forms.addEventListener('submit', (e) => {
  e.preventDefault();
  // Validate text fields to prevent empty or whitespace-only submissions
  const descriptionValue = forms.description.value.trim();
  if (descriptionValue === '') {
    alert('Description cannot be empty or contain only spaces.');
    return;
  }
  // Chronological Validation: Ensure the event's end time strictly follows the start time
  if (forms.start_time.value >= forms.end_time.value) {
    alert('The end time must be AFTER the start time!');
    return;
  }
  // Construct the new event object by mapping form input values to the dataset schema
  const newEvent = {
    event_id: fakeEvents.length + 1,
    title: forms.title.value,
    description: forms.description.value,
    category: forms.category.value,
    event_date: forms.event_date.value,
    start_time: forms.start_time.value,
    end_time: forms.end_time.value,
    location: forms.location.value,
    capacity: forms.capacity.value,
    status: forms.status.value,
    organizer_id: forms.organizer_id.value,
    created_on: new Date().toLocaleDateString(),
  };
  // Append the newly created event object to the mock database array
  fakeEvents.push(newEvent);

  console.log(fakeEvents);
  // Target the preview container and clear any existing elements to prepare for rendering
  const page = document.querySelector('.displayCard');
  page.replaceChildren();

  const currentIndex = fakeEvents.length - 1;
  const newEventData = fakeEvents[currentIndex];

  const createdHeader = document.createElement('p');
  const card = document.createElement('div');
  card.classList.add('cardDisplay');
  // Dynamically generate the HTML structure to display a live preview of the new event card
  card.innerHTML = `
    <h2>${newEventData.title}</h2>
    <div class="card-content">
      <div class="description"><p>Description</p><p>${newEventData.description}</p></div>
      <div class="category"><p>Category</p><p>${newEventData.category}</p></div>
      <div class="event_date"><p>Date</p><p>${newEventData.event_date}</p></div>
      <div class="start_time"><p>Start Time</p><p>${newEventData.start_time}</p></div>
      <div class="end_time"><p>End Time</p><p>${newEventData.end_time}</p></div>
      <div class="location"><p>Location</p><p>${newEventData.location}</p></div>
      <div class="capacity"><p>Capacity</p><p>${newEventData.capacity}</p></div>
      <div class="organizer_id"><p>Organizer</p><p>${newEventData.organizer_id}</p></div>
      <div class="status"><p>Status</p><p>${newEventData.status}</p></div>
    </div>
  `;
  //Created Title
  createdHeader.classList.add('createdHeader');
  createdHeader.textContent = 'Created Event';
  page.append(createdHeader);

  page.append(card);
});
