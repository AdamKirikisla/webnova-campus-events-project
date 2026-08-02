// Inject a default demo student into localStorage if no users exist
const initDemoData = () => {
  const existingUsers = localStorage.getItem('eventPlatformUsers');

  if (!existingUsers) {
    const demoStudent = {
      email: 'demo@live.concordia.ca',
      password: 'Password123',
      firstName: 'Alex',
      lastName: 'Tremblay',
      studentId: '43219876',
      role: 'student',
      registeredEvents: [1, 3],
    };

    const users = [demoStudent];
    localStorage.setItem('eventPlatformUsers', JSON.stringify(users));
  }
};

initDemoData();
