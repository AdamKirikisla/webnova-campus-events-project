document.addEventListener('DOMContentLoaded', () => {
  // 1. Session Management
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // S'assurer que les tableaux existent dans le profil de l'utilisateur
  if (!currentUser.registeredEvents) currentUser.registeredEvents = [];
  if (!currentUser.eventHistory) currentUser.eventHistory = {}; // Pour stocker 'attended' ou 'missed'

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // 2. Récupérer l'événement via l'URL
  const params = new URLSearchParams(window.location.search);
  const eventId = Number(params.get('id'));
  const event = typeof fakeEvents !== 'undefined' ? fakeEvents.find((item) => item.event_id === eventId) : null;

  const titleElement = document.getElementById('event-title');
  const detailsElement = document.getElementById('event-details');
  const actionsElement = document.getElementById('dynamic-actions');

  if (!event) {
    titleElement.textContent = 'Event not found';
    detailsElement.innerHTML = '<p>Sorry, this event could not be found or has been removed.</p>';
    return;
  }

  // 3. Injecter les informations de l'événement dans la grille
  titleElement.textContent = event.title;
  detailsElement.innerHTML = `
    <div class="detail-item detail-full-width">
      <span class="detail-label">Description</span>
      <p>${event.description}</p>
    </div>
    <div class="detail-item"><span class="detail-label">Category</span><p>${event.category}</p></div>
    <div class="detail-item"><span class="detail-label">Location</span><p>${event.location}</p></div>
    <div class="detail-item"><span class="detail-label">Date</span><p>${event.event_date}</p></div>
    <div class="detail-item"><span class="detail-label">Time</span><p>${event.start_time} - ${event.end_time}</p></div>
    <div class="detail-item"><span class="detail-label">Capacity</span><p>${event.capacity} students</p></div>
    <div class="detail-item"><span class="detail-label">Organizer</span><p>${event.organizer_id}</p></div>
  `;

  // 4. LOGIQUE D'INSCRIPTION (State Machine)

  // Mettre la date d'aujourd'hui à minuit pour une comparaison juste
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.event_date);

  // Variables d'état
  const isPast = eventDate < today;
  const isRegistered = currentUser.registeredEvents.includes(eventId);
  const historyStatus = currentUser.eventHistory[eventId]; // Renvoie 'attended' ou 'missed'

  // Fonction utilitaire pour sauvegarder et rafraîchir
  const saveUserToDB = () => {
    // Met à jour la session active
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Met à jour la "Base de données" globale pour que ça persiste
    const users = JSON.parse(localStorage.getItem('eventPlatformUsers')) || [];
    const index = users.findIndex((u) => u.email === currentUser.email);
    if (index !== -1) {
      users[index] = currentUser;
      localStorage.setItem('eventPlatformUsers', JSON.stringify(users));
    }

    // Recharge la page pour afficher le nouveau statut
    window.location.reload();
  };

  // --- ARBRE DE DÉCISION DES BOUTONS ---

  if (event.status === 'cancelled') {
    // Cas 1 : L'événement est annulé
    actionsElement.innerHTML = `<p style="color: #d32f2f; font-weight: bold; font-size: 1.1rem;">🚨 This event has been cancelled.</p>`;
  } else if (isPast) {
    // Cas 2 : L'événement est dans le passé
    if (isRegistered) {
      if (historyStatus === 'attended') {
        actionsElement.innerHTML = `<p style="color: #2e7d32; font-weight: bold;">✅ You attended this event. Hope you had fun!</p>`;
      } else if (historyStatus === 'missed') {
        actionsElement.innerHTML = `<p style="color: #d32f2f; font-weight: bold;">❌ You missed this event.</p>`;
      } else {
        // L'utilisateur était inscrit, mais n'a pas encore dit s'il est venu
        actionsElement.innerHTML = `
          <div style="width: 100%;">
            <p style="margin-bottom: 0.8rem; font-weight: bold; color: var(--primary-color);">You were registered for this event. Did you attend?</p>
            <div style="display: flex; gap: 1rem;">
              <button id="btn-attended" class="btn btn-primary" style="background: #2e7d32; border-color: #2e7d32;">Yes, I went</button>
              <button id="btn-missed" class="btn btn-outline" style="color: #d32f2f; border-color: #d32f2f;">No, I missed it</button>
            </div>
          </div>
        `;
        document.getElementById('btn-attended').addEventListener('click', () => {
          currentUser.eventHistory[eventId] = 'attended';
          saveUserToDB();
        });
        document.getElementById('btn-missed').addEventListener('click', () => {
          currentUser.eventHistory[eventId] = 'missed';
          saveUserToDB();
        });
      }
    } else {
      actionsElement.innerHTML = `<p style="color: #666; font-style: italic;">This event has already passed.</p>`;
    }
  } else {
    // Cas 3 : L'événement est dans le futur
    if (isRegistered) {
      // Déjà inscrit -> Possibilité de Drop
      actionsElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <p style="color: #2e7d32; font-weight: bold; margin: 0;">✅ You are successfully registered!</p>
          <button id="btn-drop" class="btn btn-outline" style="color: #d32f2f; border-color: #d32f2f;">Drop Event</button>
        </div>
      `;
      document.getElementById('btn-drop').addEventListener('click', () => {
        if (confirm('Are you sure you want to drop this event?')) {
          // Retire l'ID du tableau des inscriptions
          currentUser.registeredEvents = currentUser.registeredEvents.filter((id) => id !== eventId);
          saveUserToDB();
        }
      });
    } else if (event.status === 'open') {
      // Pas inscrit, événement ouvert -> Bouton Register
      actionsElement.innerHTML = `<button id="btn-register" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.8rem 2rem;">Register Now</button>`;
      document.getElementById('btn-register').addEventListener('click', () => {
        // Ajoute l'ID au tableau des inscriptions
        currentUser.registeredEvents.push(eventId);
        saveUserToDB();
        alert('Registration successful!');
      });
    } else if (event.status === 'full') {
      // Pas inscrit, événement plein -> Message
      actionsElement.innerHTML = `<p style="color: #f57c00; font-weight: bold;">⚠️ This event is currently full.</p>`;
    }
  }
});
