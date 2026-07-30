const toggleLogin = document.getElementById('toggle-login');
const toggleSignup = document.getElementById('toggle-signup');
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');

// Basculer entre Connexion et Inscription
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

// 2. Si le paramètre "mode" est égal à "signup", on affiche l'inscription
if (mode === 'signup') {
  // On simule un clic sur le bouton toggle d'inscription
  toggleSignup.click();
} else {
  toggleLogin.click();
}

// --- LOGIQUE DE SIMULATION BACKEND ---

// Variables admin hardcodées
const ADMIN_EMAIL = 'admin@live.concordia.ca';
const ADMIN_PASSWORD = 'admin';

// Gérer l'inscription (Élève)
formSignup.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const firstname = document.getElementById('signup-firstname').value;
  const lastname = document.getElementById('signup-lastname').value;
  const studentId = document.getElementById('signup-id').value;

  // Récupérer les utilisateurs existants ou initialiser un tableau vide
  const users = JSON.parse(localStorage.getItem('eventPlatformUsers')) || [];

  // Vérifier si l'utilisateur existe déjà
  if (users.find((u) => u.email === email)) {
    alert('Ce courriel est déjà utilisé !');
    return;
  }

  if (users.find((u) => u.studentId === studentId)) {
    alert('Cet ID étudiant est déjà utilisé !');
    return;
  }

  // Sauvegarder le nouvel utilisateur
  const newUser = { email, password, firstname, lastname, studentId, role: 'student' };
  users.push(newUser);
  localStorage.setItem('eventPlatformUsers', JSON.stringify(users));

  alert('Compte créé avec succès ! Tu peux maintenant te connecter.');
  toggleLogin.click(); // Ramène l'utilisateur à l'écran de connexion
  formSignup.reset();
});

// Gérer la connexion
formLogin.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // 1. Vérifier si c'est l'admin hardcodé
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem('currentUser', JSON.stringify({ role: 'admin', email: ADMIN_EMAIL }));
    window.location.href = 'admin-dashboard.html';
    return;
  }

  // 2. Sinon, vérifier dans le localStorage (Élèves)
  const users = JSON.parse(localStorage.getItem('eventPlatformUsers')) || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    const sessionUser = { name: user.name, email: user.email, role: 'student' };
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    alert('Connexion réussie ! Bienvenue ' + user.name);
    window.location.href = 'student-dashboard.html';
  } else {
    alert('Courriel ou mot de passe incorrect.');
  }
});
