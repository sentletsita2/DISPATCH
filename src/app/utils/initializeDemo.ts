// Initialize demo users for testing
export const initializeDemoData = () => {
  const existingUsers = localStorage.getItem('users');
  
  if (!existingUsers) {
    const demoUsers = [
      {
        id: 'p202612345',
        username: 'passenger1',
        password: 'password',
        fullName: 'John Passenger',
        email: 'passenger@demo.com',
        phoneNumber: '+263 77 123 4567',
        dob: '1990-01-15',
        idNumber: '63-123456A63',
        userType: 'passenger',
        rating: 4.8,
        dispatchCash: 50.00,
        clockedIn: false,
        documentsVerified: false,
      },
      {
        id: 'd202612346',
        username: 'driver1',
        password: 'password',
        fullName: 'Sarah Driver',
        email: 'driver@demo.com',
        phoneNumber: '+263 77 987 6543',
        dob: '1988-05-20',
        idNumber: '63-987654Z63',
        userType: 'driver',
        rating: 4.9,
        dispatchCash: 125.50,
        clockedIn: false,
        documentsVerified: true,
      },
    ];
    
    localStorage.setItem('users', JSON.stringify(demoUsers));
    console.log('Demo users initialized! Use these credentials:');
    console.log('Passenger - Username: passenger1, Password: password');
    console.log('Driver - Username: driver1, Password: password');
  }
};