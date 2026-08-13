document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verify Active Session (currentUser now carries the real database user_id)
  const currentUser = WebNovaAPI.requireLogin();
  if (!currentUser) return;

  // Handle Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      WebNovaAPI.logout();
    });
  }

  // 2. UI Elements Selection
  const profileView = document.getElementById('profile-view');
  const profileForm = document.getElementById('profile-form');
  const btnEdit = document.getElementById('btn-edit');
  const btnCancel = document.getElementById('btn-cancel');

  // 3. Fetch the account straight from the database, so the page shows what is
  //    actually stored rather than whatever the session was created with.
  let fullUser;
  try {
    fullUser = await WebNovaAPI.getUser(currentUser.user_id);
  } catch (err) {
    console.error(err);
    document.getElementById('view-name').textContent = 'Could not load profile.';
    document.getElementById('view-email').textContent = '—';
    document.getElementById('view-id').textContent = '—';
    if (btnEdit) btnEdit.disabled = true;
    return;
  }

  // Keep the stored session in step with the database.
  WebNovaAPI.setCurrentUser({ ...currentUser, ...fullUser });

  // Fill both the read-only card and the edit form.
  function populate(user) {
    document.getElementById('view-name').textContent = `${user.firstName} ${user.lastName}`.trim();
    document.getElementById('view-email').textContent = user.email;
    document.getElementById('view-id').textContent = user.studentId || 'Not set';

    document.getElementById('profile-firstname').value = user.firstName || '';
    document.getElementById('profile-lastname').value = user.lastName || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-id').value = user.studentId || '';
    document.getElementById('profile-password').value = '';
  }

  populate(fullUser);

  // 4. Toggle Logic for Edit / Cancel Buttons
  btnEdit.addEventListener('click', () => {
    profileView.classList.add('hidden');
    profileForm.classList.remove('hidden');
  });

  btnCancel.addEventListener('click', () => {
    profileForm.classList.add('hidden');
    profileView.classList.remove('hidden');
    // Discard anything typed before cancelling
    populate(fullUser);
  });

  // 5. Handle Form Submission — persists to the Users table
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = profileForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // The server enforces the duplicate email / student ID rules and
      // only changes the password when a new one was actually typed.
      const updated = await WebNovaAPI.updateUser(currentUser.user_id, {
        firstName: document.getElementById('profile-firstname').value.trim(),
        lastName: document.getElementById('profile-lastname').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        studentId: document.getElementById('profile-id').value.trim(),
        password: document.getElementById('profile-password').value,
      });

      fullUser = updated;
      WebNovaAPI.setCurrentUser({ ...currentUser, ...updated });
      populate(updated);

      profileForm.classList.add('hidden');
      profileView.classList.remove('hidden');
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
