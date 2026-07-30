const toggleLogin = document.getElementById('toggle-login');
const toggleSignup = document.getElementById('toggle-signup');
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');

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

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

if (mode === 'signup') {
  toggleSignup.click();
} else {
  toggleLogin.click();
}

// --- BACKEND SIMULATION ---

const ADMIN_EMAIL = 'admin@live.concordia.ca';
const ADMIN_PASSWORD = 'admin';

formSignup.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const firstName = document.getElementById('signup-firstname').value;
  const lastName = document.getElementById('signup-lastname').value;
  const studentId = document.getElementById('signup-id').value;

  const users = JSON.parse(localStorage.getItem('eventPlatformUsers')) || [];

  if (users.find((u) => u.email === email)) {
    alert('This email is already in use.');
    return;
  }

  if (users.find((u) => u.studentId === studentId)) {
    alert('This student ID is already in use.');
    return;
  }

  const newUser = { email, password, firstname, lastname, studentId, role: 'student', registeredEvents: [] };
  users.push(newUser);
  localStorage.setItem('eventPlatformUsers', JSON.stringify(users));

  alert('Compte créé avec succès ! Tu peux maintenant te connecter.');
  toggleLogin.click();
  formSignup.reset();
});

formLogin.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem('currentUser', JSON.stringify({ role: 'admin', email: ADMIN_EMAIL }));
    window.location.href = 'admin-dashboard.html';
    return;
  }

  const users = JSON.parse(localStorage.getItem('eventPlatformUsers')) || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    const sessionUser = {
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role ?? 'student',
    };
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    window.location.href = 'student-dashboard.html';
  } else {
    alert('Courriel ou mot de passe incorrect.');
  }
});
