import React, { useState, useEffect } from 'react';
import { User, InstantBooking } from '../App';
import { ArrowLeft, CheckCircle, XCircle, Clock, User as UserIcon, CreditCard } from 'lucide-react';

interface InstantBookingRequestsProps {
  user: User;
  onBack: () => void;
}

export default function InstantBookingRequests({ user, onBack }: InstantBookingRequestsProps) {
  const [requests, setRequests] = useState<InstantBooking[]>([]);

  useEffect(() => {
    loadRequests();
  }, [user.id]);

  const loadRequests = () => {
    const allBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
    const myRequests = allBookings.filter(
      (b: InstantBooking) => b.providerId === user.id && b.status === 'pending'
    );
    setRequests(myRequests);
  };

  const handleAccept = (requestId: string) => {
    const allBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
    const updatedBookings = allBookings.map((b: InstantBooking) => {
      if (b.id === requestId) {
        return { ...b, status: 'accepted' };
      }
      return b;
    });
    localStorage.setItem('instantBookings', JSON.stringify(updatedBookings));

    // Add notification to customer
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        userId: request.customerId,
        message: `${user.name} has accepted your instant booking request for ${request.serviceType}! Please proceed to payment.`,
        timestamp: new Date().toLocaleString(),
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    loadRequests();
    alert('Request accepted successfully!');
  };

  const handleReject = (requestId: string) => {
    const allBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
    const updatedBookings = allBookings.map((b: InstantBooking) => {
      if (b.id === requestId) {
        return { ...b, status: 'rejected' };
      }
      return b;
    });
    localStorage.setItem('instantBookings', JSON.stringify(updatedBookings));

    // Add notification to customer
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        userId: request.customerId,
        message: `${user.name} has declined your instant booking request for ${request.serviceType}.`,
        timestamp: new Date().toLocaleString(),
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    loadRequests();
    alert('Request rejected');
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
          <h1 className="text-3xl text-gray-800">Instant Booking Requests</h1>
          <p className="text-gray-600">Review and manage your instant booking requests</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {requests.length > 0 ? (
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-3 mr-4">
                        <UserIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl text-gray-800 mb-1">{request.customerName}</h3>
                        <p className="text-gray-600">Instant Booking Request</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                      <span className="text-sm text-yellow-700">Pending</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Service Type</p>
                      <p className="text-gray-800">{request.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Amount</p>
                      <p className="text-gray-800">₹{request.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Request Date</p>
                      <p className="text-gray-800">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Payment Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        request.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {request.description && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-2">Service Description</p>
                      <p className="text-gray-800">{request.description}</p>
                    </div>
                  )}

                  {request.images && request.images.length > 0 && (
                    <div className="mb-6">
                      <p className="text-gray-600 text-sm mb-2">Attached Images</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {request.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Request image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Your Earnings:</strong> ₹{(request.amount * 0.9).toFixed(2)} (After
                      10% platform commission)
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Clock className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl text-gray-800 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">
                You don't have any pending instant booking requests at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
