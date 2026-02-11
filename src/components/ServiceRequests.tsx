import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { ArrowLeft, CheckCircle, XCircle, Clock, User as UserIcon } from 'lucide-react';

interface ServiceRequestsProps {
  user: User;
  onBack: () => void;
}

export default function ServiceRequests({ user, onBack }: ServiceRequestsProps) {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, [user.id]);

  const loadRequests = () => {
    const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const myRequests = allSubscriptions.filter(
      (s: any) => s.providerId === user.id && s.status === 'pending'
    );
    setRequests(myRequests);
  };

  const handleAccept = (requestId: string) => {
    const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const updatedSubscriptions = allSubscriptions.map((s: any) => {
      if (s.id === requestId) {
        return { ...s, status: 'active' };
      }
      return s;
    });
    localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));

    // Add notification to customer
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        userId: request.customerId,
        message: `${user.name} has accepted your subscription request for ${request.serviceType}!`,
        timestamp: new Date().toLocaleString(),
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    loadRequests();
    alert('Request accepted successfully!');
  };

  const handleReject = (requestId: string) => {
    const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const updatedSubscriptions = allSubscriptions.map((s: any) => {
      if (s.id === requestId) {
        return { ...s, status: 'rejected' };
      }
      return s;
    });
    localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));

    // Add notification to customer
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        userId: request.customerId,
        message: `${user.name} has declined your subscription request for ${request.serviceType}.`,
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
          <h1 className="text-3xl text-gray-800">Service Requests</h1>
          <p className="text-gray-600">Review and manage your subscription requests</p>
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
                        <p className="text-gray-600">Subscription Request</p>
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
                      <p className="text-gray-600 text-sm mb-1">Subscription Plan</p>
                      <p className="text-gray-800 capitalize">{request.plan}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Amount</p>
                      <p className="text-gray-800">₹{request.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Request Date</p>
                      <p className="text-gray-800">
                        {new Date(request.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

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
                You don't have any pending subscription requests at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
