// Fake Student for dev / demo purposes

const initDemoData = () => {
  const existingUsers = localStorage.getItem('eventPlatformUsers');

  if (!existingUsers) {
    const demoStudent = {
      email: 'demo@live.concordia.ca',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Tremblay',
      studentId: '43219876',
      role: 'student',
      registeredEvents: [1, 3],
    };

    const users = [demoStudent];
    localStorage.setItem('eventPlatformUsers', JSON.stringify(users));

    console.log("Base de données initialisée avec l'étudiant de démo !");
  }
};

initDemoData();
