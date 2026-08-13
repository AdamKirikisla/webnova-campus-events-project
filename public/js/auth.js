// DOM elements selection for authentication forms and toggle buttons
const toggleLogin = document.getElementById('toggle-login');
const toggleSignup = document.getElementById('toggle-signup');
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
// Handle UI transitions between Login and Sign Up views
toggleSignup.addEventListener('click', () => {
  formLogin.classList.add('hidden');
  formSignup.classList.remove('hidden');
  toggleSignup.classList.add('active');
  toggleLogin.classList.remove('active');
});

toggleLogin.addEventListener('click', () => {
  formSignup.classList.add('hidden');
  formLogin.classList.remove('hidden');
  toggleLogin.classList.add('active');
  toggleSignup.classList.remove('active');
});
// Auto-select Sign Up form if '?mode=signup' is present in the URL
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

if (mode === 'signup') {
  toggleSignup.click();
} else {
  toggleLogin.click();
}

// --- REAL BACKEND ---
// Signup and login now go through the Express API (/auth/signup, /auth/login),
// which reads and writes the Users table. The session stored in localStorage
// holds the real numeric user_id, which the other pages need in order to load
// that student's registrations.

// Create an account in the database, then switch back to the login form.
formSignup.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = formSignup.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    await WebNovaAPI.signup({
      firstName: document.getElementById('signup-firstname').value.trim(),
      lastName: document.getElementById('signup-lastname').value.trim(),
      email: document.getElementById('signup-email').value.trim(),
      password: document.getElementById('signup-password').value,
      studentId: document.getElementById('signup-id').value.trim(),
    });

    alert('Account created successfully! You can now log in.');
    toggleLogin.click();
    formSignup.reset();
  } catch (err) {
    // The server sends a clear message for duplicate email / student ID.
    alert(err.message);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// Log in against the database and route by role.
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = formLogin.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const user = await WebNovaAPI.login(
      document.getElementById('login-email').value.trim(),
      document.getElementById('login-password').value
    );

    WebNovaAPI.setCurrentUser(user);
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
  } catch (err) {
    alert(err.message);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});
