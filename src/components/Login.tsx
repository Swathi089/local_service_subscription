import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { User, UserRole } from '../App';

interface LoginProps {
  selectedRole: UserRole;
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export default function Login({ selectedRole, onSuccess, onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Add demo customer
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find((u: any) => u.email === 'customer@test.com')) {
      users.push({
        id: 'customer-1',
        name: 'Demo Customer',
        email: 'customer@test.com',
        mobile: '9876543210',
        address: '123 Demo Street, Test City',
        password: btoa('password123'),
        role: 'customer',
      });
    }

    // Add demo provider
    if (!users.find((u: any) => u.email === 'provider@test.com')) {
      users.push({
        id: 'provider-1',
        name: 'Demo Provider',
        email: 'provider@test.com',
        mobile: '9876543210',
        serviceType: 'Plumber',
        serviceArea: 'Mumbai',
        password: btoa('password123'),
        role: 'provider',
        status: 'approved',
      });

      // Add demo service for the provider
      const services = JSON.parse(localStorage.getItem('services') || '[]');
      if (!services.find((s: any) => s.providerId === 'provider-1')) {
        services.push({
          id: 'service-provider-1',
          providerId: 'provider-1',
          providerName: 'Demo Provider',
          serviceType: 'Plumber',
          serviceArea: 'Mumbai',
          rating: 4.5,
          priceMonthly: 500,
          priceQuarterly: 1400,
          priceAnnual: 5000,
          description: 'Professional plumbing services in Mumbai',
          available: true,
        });
        localStorage.setItem('services', JSON.stringify(services));
      }
    }

    localStorage.setItem('users', JSON.stringify(users));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      setError('User not found. Please register first.');
      return;
    }

    // Verify password
    if (atob(user.password) !== password) {
      setError('Incorrect password');
      return;
    }

    // Check role match
    if (selectedRole && user.role !== selectedRole) {
      setError(`This account is registered as ${user.role}, not ${selectedRole}`);
      return;
    }

    // Login successful
    const loggedInUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      address: user.address,
      serviceType: user.serviceType,
      serviceArea: user.serviceArea,
      status: user.status,
    };

    onSuccess(loggedInUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <LogIn className="w-12 h-12 text-indigo-500 mr-3" />
            <h2 className="text-3xl text-gray-800">Login</h2>
          </div>

          {selectedRole && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-center text-indigo-700">
                Logging in as: <strong className="capitalize">{selectedRole}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">Customer: customer@test.com / password123</p>
            <p className="text-xs text-gray-500 mt-2">Provider: provider@test.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
