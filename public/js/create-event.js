const forms = document.querySelector('.forms');
// Restrict the date input minimum value to today to prevent scheduling events in the past
const dateInput = document.querySelector('input[name="event_date"]');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

// STEP 1: load real categories from the backend and fill in the dropdown
async function loadCategories() {
  const categorySelect = document.querySelector('select[name="category_id"]');
  try {
    const response = await fetch('/categories');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const categories = await response.json();

    for (let category of categories) {
      const option = document.createElement('option');
      option.value = category.category_id;
      option.textContent = category.category_name;
      categorySelect.appendChild(option);
    }
  } catch (error) {
    console.log('Something went wrong:', error);
  }
}

loadCategories();

// STEP 2: submit the form via POST /events instead of fakeEvents.push()
forms.addEventListener('submit', async (e) => {
  e.preventDefault();

  const descriptionValue = forms.description.value.trim();
  if (descriptionValue === '') {
    alert('Description cannot be empty or contain only spaces.');
    return;
  }

  if (forms.start_time.value >= forms.end_time.value) {
    alert('The end time must be AFTER the start time!');
    return;
  }

  // forms can access elements due to 'name' element in HTML
  const payload = {
    title: forms.title.value,
    description: descriptionValue,
    category_id: Number(forms.category_id.value),
    event_date: forms.event_date.value,
    start_time: forms.start_time.value,
    end_time: forms.end_time.value,
    location: forms.location.value,
    capacity: Number(forms.capacity.value),
    organizer_id: forms.organizer_id.value,
  };

  try {
    const response = await fetch('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    alert('Event created successfully!');
    forms.reset();
  } catch (error) {
    console.log('Something went wrong:', error);
    alert('Could not create event.');
  }
});
