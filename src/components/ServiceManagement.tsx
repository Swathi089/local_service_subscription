import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { ArrowLeft, Save, ToggleLeft, ToggleRight, DollarSign, MapPin } from 'lucide-react';

interface ServiceManagementProps {
  user: User;
  onBack: () => void;
}

export default function ServiceManagement({ user, onBack }: ServiceManagementProps) {
  const [serviceData, setServiceData] = useState({
    available: true,
    priceMonthly: 500,
    priceQuarterly: 1400,
    priceAnnual: 5000,
    description: '',
    serviceArea: user.serviceArea || '',
  });

  useEffect(() => {
    // Load existing service data
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const myService = services.find((s: any) => s.providerId === user.id);
    if (myService) {
      setServiceData({
        available: myService.available,
        priceMonthly: myService.priceMonthly,
        priceQuarterly: myService.priceQuarterly,
        priceAnnual: myService.priceAnnual,
        description: myService.description,
        serviceArea: myService.serviceArea,
      });
    }
  }, [user.id]);

  const handleSave = () => {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const serviceIndex = services.findIndex((s: any) => s.providerId === user.id);

    if (serviceIndex !== -1) {
      // Update existing service
      services[serviceIndex] = {
        ...services[serviceIndex],
        ...serviceData,
      };
    } else {
      // Create new service
      services.push({
        id: `service-${Date.now()}`,
        providerId: user.id,
        providerName: user.name,
        serviceType: user.serviceType,
        rating: 4.5,
        ...serviceData,
      });
    }

    localStorage.setItem('services', JSON.stringify(services));
    alert('Service updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl text-gray-800">Service Management</h1>
          <p className="text-gray-600">Manage your service details and pricing</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl mb-4 text-gray-800">Service Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Service Type</p>
                <p className="text-lg text-gray-800">{user.serviceType}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Provider Name</p>
                <p className="text-lg text-gray-800">{user.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl mb-4 text-gray-800">Service Availability</h2>
            <div
              onClick={() => setServiceData({ ...serviceData, available: !serviceData.available })}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <div>
                <p className="text-gray-800">Currently {serviceData.available ? 'Available' : 'Unavailable'}</p>
                <p className="text-sm text-gray-600">
                  {serviceData.available
                    ? 'Your service is visible to customers'
                    : 'Your service is hidden from customers'}
                </p>
              </div>
              {serviceData.available ? (
                <ToggleRight className="w-12 h-12 text-green-500" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl mb-4 text-gray-800 flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              Pricing
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Monthly Price (₹)</label>
                <input
                  type="number"
                  value={serviceData.priceMonthly}
                  onChange={(e) =>
                    setServiceData({ ...serviceData, priceMonthly: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Quarterly Price (₹)</label>
                <input
                  type="number"
                  value={serviceData.priceQuarterly}
                  onChange={(e) =>
                    setServiceData({
                      ...serviceData,
                      priceQuarterly: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: ₹{serviceData.priceMonthly * 3} (Monthly × 3)
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Annual Price (₹)</label>
                <input
                  type="number"
                  value={serviceData.priceAnnual}
                  onChange={(e) =>
                    setServiceData({ ...serviceData, priceAnnual: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: ₹{serviceData.priceMonthly * 12} (Monthly × 12)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl mb-4 text-gray-800 flex items-center">
              <MapPin className="w-6 h-6 mr-2" />
              Service Area
            </h2>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Service Coverage Areas</label>
              <input
                type="text"
                value={serviceData.serviceArea}
                onChange={(e) => setServiceData({ ...serviceData, serviceArea: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Mumbai, Navi Mumbai, Thane"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter areas you provide service to, separated by commas
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl mb-4 text-gray-800">Service Description</h2>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Description</label>
              <textarea
                value={serviceData.description}
                onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your service, experience, and what makes you unique..."
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> Platform charges 10% commission on all transactions. You will
              receive 90% of the subscription amount.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
