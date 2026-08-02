document.addEventListener('DOMContentLoaded', () => {
  // 1. Verify Active Session
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Handle Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // 2. Fetch the full user object from the database
  const usersDB = JSON.parse(localStorage.getItem('eventPlatformUsers')) || [];
  const userIndex = usersDB.findIndex((u) => u.email === currentUser.email);

  if (userIndex === -1) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
    return;
  }

  const fullUser = usersDB[userIndex];

  // 3. UI Elements Selection
  const profileView = document.getElementById('profile-view');
  const profileForm = document.getElementById('profile-form');
  const btnEdit = document.getElementById('btn-edit');
  const btnCancel = document.getElementById('btn-cancel');

  // Populate the STATIC VIEW (Read-only card)
  document.getElementById('view-name').textContent = `${fullUser.firstName} ${fullUser.lastName}`;
  document.getElementById('view-email').textContent = fullUser.email;
  document.getElementById('view-id').textContent = fullUser.studentId;

  // Populate the FORM INPUTS
  document.getElementById('profile-firstname').value = fullUser.firstName || '';
  document.getElementById('profile-lastname').value = fullUser.lastName || '';
  document.getElementById('profile-email').value = fullUser.email || '';
  document.getElementById('profile-id').value = fullUser.studentId || '';

  // 4. Toggle Logic for Edit / Cancel Buttons
  btnEdit.addEventListener('click', () => {
    // Hide the static view and show the form
    profileView.classList.add('hidden');
    profileForm.classList.remove('hidden');
  });

  btnCancel.addEventListener('click', () => {
    // Hide the form and show the static view again
    profileForm.classList.add('hidden');
    profileView.classList.remove('hidden');

    // Optional: Reset form values in case they typed something before cancelling
    document.getElementById('profile-firstname').value = fullUser.firstName || '';
    document.getElementById('profile-lastname').value = fullUser.lastName || '';
    document.getElementById('profile-email').value = fullUser.email || '';
    document.getElementById('profile-id').value = fullUser.studentId || '';
    document.getElementById('profile-password').value = '';
  });

  // 5. Handle Form Submission
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newFirstName = document.getElementById('profile-firstname').value.trim();
    const newLastName = document.getElementById('profile-lastname').value.trim();
    const newEmail = document.getElementById('profile-email').value.trim();
    const newId = document.getElementById('profile-id').value.trim();
    const newPass = document.getElementById('profile-password').value;

    // Check if the NEW email is taken
    if (newEmail !== fullUser.email) {
      if (usersDB.some((u) => u.email === newEmail)) {
        alert('This email is already in use by another account.');
        return;
      }
    }

    // Check if the NEW Student ID is taken
    if (newId !== fullUser.studentId) {
      if (usersDB.some((u) => u.studentId === newId)) {
        alert('This Student ID is already registered in the system.');
        return;
      }
    }

    // Update DB object
    fullUser.firstName = newFirstName;
    fullUser.lastName = newLastName;
    fullUser.email = newEmail;
    fullUser.studentId = newId;
    if (newPass !== '') fullUser.password = newPass;

    // Save to LocalStorage DB
    usersDB[userIndex] = fullUser;
    localStorage.setItem('eventPlatformUsers', JSON.stringify(usersDB));

    // Update current session
    currentUser.name = `${fullUser.firstName} ${fullUser.lastName}`.trim();
    currentUser.email = fullUser.email;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert('Profile updated successfully!');
    window.location.reload(); // Reload to refresh both static view and header
  });
});
