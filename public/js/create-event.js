const forms = document.querySelector('.forms');
const input = document.querySelectorAll('.input');

// 1. AJOUT : Bloquer les dates dans le passé dès le chargement de la page
const dateInput = document.querySelector('input[name="event_date"]');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

forms.addEventListener('submit', (e) => {
  e.preventDefault();

  // 2. AJOUT : Valider les données avant de construire la carte
  const descriptionValue = forms.description.value.trim();
  if (descriptionValue === '') {
    alert('La description ne peut pas être vide ou ne contenir que des espaces.');
    return; // Le return est crucial, il empêche l'événement de se créer
  }

  if (forms.start_time.value >= forms.end_time.value) {
    alert("L'heure de fin doit être APRÈS l'heure de début !");
    return; // Le return tue la fonction ici aussi
  }

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

  fakeEvents.push(newEvent); // adds to the SAME shared array your cards are built from

  console.log(fakeEvents);

  // ---------------------------------------------------------------------------
  // 1. BUILD CARDS FROM fakeEvents
  // ---------------------------------------------------------------------------
  const page = document.querySelector('.displayCard');
  page.replaceChildren();

  const currentIndex = fakeEvents.length - 1;
  const newEventData = fakeEvents[currentIndex];

  const createdHeader = document.createElement('p');
  const card = document.createElement('div');
  card.classList.add('cardDisplay');

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
