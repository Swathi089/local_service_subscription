import React, { useState } from 'react';
import { UserRole } from '../App';
import { Users, Wrench } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onSelectRole, onNavigate }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    onSelectRole(role);
  };

  const handleLogin = () => {
    if (selectedRole) {
      onNavigate('login');
    } else {
      alert('Please select a role first');
    }
  };

  const handleRegister = () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }
    if (selectedRole === 'customer') {
      onNavigate('customer-register');
    } else if (selectedRole === 'provider') {
      onNavigate('provider-register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 text-gray-800">Local Service Subscription Platform</h1>
          <p className="text-xl text-gray-600">Connect with trusted local service providers</p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl mb-8 text-center text-gray-800">Select Your Role</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Card */}
            <div
              onClick={() => handleRoleSelect('customer')}
              className={`bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all hover:shadow-2xl ${
                selectedRole === 'customer' ? 'ring-4 ring-blue-500 transform scale-105' : ''
              }`}
            >
              <div className="flex justify-center mb-4">
                <Users className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-2xl mb-3 text-center text-gray-800">Customer</h3>
              <p className="text-gray-600 text-center">
                Find and subscribe to local services for your home and business needs
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✓ Browse services</li>
                <li>✓ Subscribe monthly/quarterly/annual</li>
                <li>✓ Manage subscriptions</li>
                <li>✓ Rate service providers</li>
              </ul>
            </div>

            {/* Service Provider Card */}
            <div
              onClick={() => handleRoleSelect('provider')}
              className={`bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all hover:shadow-2xl ${
                selectedRole === 'provider' ? 'ring-4 ring-green-500 transform scale-105' : ''
              }`}
            >
              <div className="flex justify-center mb-4">
                <Wrench className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-2xl mb-3 text-center text-gray-800">Service Provider</h3>
              <p className="text-gray-600 text-center">
                Offer your services and build a recurring customer base
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✓ List your services</li>
                <li>✓ Manage service requests</li>
                <li>✓ Track earnings</li>
                <li>✓ Build reputation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={!selectedRole}
                className={`w-full py-4 rounded-lg text-white transition-colors ${
                  selectedRole
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                disabled={!selectedRole}
                className={`w-full py-4 rounded-lg text-white transition-colors ${
                  selectedRole
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Demo credentials - Customer: customer@test.com (password: password123)
          </p>
        </div>
      </div>
    </div>
  );
}
