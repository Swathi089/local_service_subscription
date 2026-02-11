import React, { useState } from 'react';
import { ArrowLeft, Briefcase } from 'lucide-react';

interface ProviderRegisterProps {
  onSuccess: () => void;
  onBack: () => void;
}

const serviceTypes = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'House Cleaning',
  'AC Repair',
  'Painter',
  'Pest Control',
  'Appliance Repair',
  'Gardener',
  'Other',
];

export default function ProviderRegister({ onSuccess, onBack }: ProviderRegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    serviceType: '',
    serviceArea: '',
    idProof: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }

    if (!formData.serviceArea.trim()) {
      newErrors.serviceArea = 'Service area is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.email === formData.email)) {
      setErrors({ email: 'Email already registered' });
      return;
    }

    // Create new provider (auto-approved since there's no admin)
    const newUserId = Date.now().toString();
    const newUser = {
      id: newUserId,
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      serviceType: formData.serviceType,
      serviceArea: formData.serviceArea,
      idProof: formData.idProof || 'Not provided',
      password: btoa(formData.password),
      role: 'provider',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Automatically create service listing for the provider
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const newService = {
      id: `service-${newUserId}`,
      providerId: newUserId,
      providerName: formData.name,
      serviceType: formData.serviceType,
      serviceArea: formData.serviceArea,
      rating: 4.5, // Default rating for new providers
      priceMonthly: 500, // Default pricing (provider can update later)
      priceQuarterly: 1400,
      priceAnnual: 5000,
      description: `Professional ${formData.serviceType} services in ${formData.serviceArea}`,
      available: true,
    };
    services.push(newService);
    localStorage.setItem('services', JSON.stringify(services));

    alert(
      'Registration successful! Your service is now listed on the platform. You can login and update your pricing and details.'
    );
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Briefcase className="w-12 h-12 text-green-500 mr-3" />
            <h2 className="text-3xl text-gray-800">Service Provider Registration</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Mobile Number *</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10-digit mobile number"
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Service Type *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select service type</option>
                {serviceTypes.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Service Area *</label>
              <input
                type="text"
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Mumbai, Bangalore, Delhi"
              />
              {errors.serviceArea && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceArea}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">ID Proof (Optional)</label>
              <input
                type="text"
                value={formData.idProof}
                onChange={(e) => setFormData({ ...formData, idProof: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="ID Proof number (Optional)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: Provide ID proof for verification
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Minimum 6 characters"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✓ Your service will be immediately listed on the platform after registration<br />
                ✓ You can login and customize pricing and service details<br />
                ✓ Customers will be able to find and subscribe to your service
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors mt-6"
            >
              Submit Registration
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <button onClick={onSuccess} className="text-green-600 hover:text-green-700">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
