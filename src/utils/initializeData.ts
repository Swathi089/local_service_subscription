// Utility function to initialize demo data
export function initializeDemoData() {
  // Check if data already exists
  if (localStorage.getItem('dataInitialized')) {
    return;
  }

  // Initialize demo users
  const users = [
    {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@test.com',
      mobile: '9999999999',
      password: btoa('password123'),
      role: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'customer-1',
      name: 'Demo Customer',
      email: 'customer@test.com',
      mobile: '9876543210',
      address: '123 Demo Street, Test City',
      password: btoa('password123'),
      role: 'customer',
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem('users', JSON.stringify(users));

  // Initialize demo services
  const services = [
    {
      id: 'service-1',
      providerId: 'provider-1',
      providerName: 'Rajesh Kumar',
      serviceType: 'Plumber',
      serviceArea: 'Mumbai, Navi Mumbai',
      rating: 4.5,
      priceMonthly: 500,
      priceQuarterly: 1400,
      priceAnnual: 5000,
      description: 'Expert plumbing services for residential and commercial properties',
      available: true,
    },
    {
      id: 'service-2',
      providerId: 'provider-2',
      providerName: 'Amit Sharma',
      serviceType: 'Electrician',
      serviceArea: 'Bangalore, Whitefield',
      rating: 4.8,
      priceMonthly: 600,
      priceQuarterly: 1700,
      priceAnnual: 6000,
      description: 'Certified electrician with 10+ years experience',
      available: true,
    },
  ];
  localStorage.setItem('services', JSON.stringify(services));

  // Mark as initialized
  localStorage.setItem('dataInitialized', 'true');
}
