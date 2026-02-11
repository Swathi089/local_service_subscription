import React from 'react';
import { User, Service } from '../App';
import { ArrowLeft, Star, MapPin, Phone, Mail, Send, User as UserIcon } from 'lucide-react';

interface ServiceProviderDetailsProps {
  user: User;
  service: Service;
  onBack: () => void;
  onSendRequest: (service: Service) => void;
}

export default function ServiceProviderDetails({
  user,
  service,
  onBack,
  onSendRequest,
}: ServiceProviderDetailsProps) {
  const handleSendRequest = () => {
    onSendRequest(service);
    alert('Instant booking request sent successfully!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Services
          </button>
          <h1 className="text-3xl text-gray-800">Service Provider Details</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Provider Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-4 mr-4">
                  <UserIcon className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-800 mb-1">{service.providerName}</h2>
                  <p className="text-gray-600 mb-2">{service.serviceType} Specialist</p>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-lg">{service.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                {service.serviceArea}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2" />
                Contact: Available on request
              </div>
            </div>

            <p className="text-gray-700">{service.description}</p>
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl text-gray-800 mb-4">Service Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Service Type</p>
                <p className="text-gray-800">{service.serviceType}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Service Area</p>
                <p className="text-gray-800">{service.serviceArea}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Rating</p>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span>{service.rating}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Availability</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  service.available
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {service.available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>

          {/* Instant Booking */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl text-gray-800 mb-4">Instant Booking</h3>
            <p className="text-gray-600 mb-4">
              Send an instant booking request to this service provider. They will review your request and contact you for scheduling and payment details.
            </p>
            <button
              onClick={handleSendRequest}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Instant Booking Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
