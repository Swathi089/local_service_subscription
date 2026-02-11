import React, { useState, useEffect } from 'react';
import { User, InstantBooking } from '../App';
import {
  Home,
  Search,
  CreditCard,
  User as UserIcon,
  Bell,
  LogOut,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function CustomerDashboard({
  user,
  onNavigate,
  onLogout,
}: CustomerDashboardProps) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [acceptedInstantBookings, setAcceptedInstantBookings] = useState<InstantBooking[]>([]);

  useEffect(() => {
    // Load customer's subscriptions
    const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const mySubscriptions = allSubscriptions.filter((s: any) => s.customerId === user.id);
    setSubscriptions(mySubscriptions);

    // Load accepted instant bookings
    const allInstantBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
    const myAcceptedBookings = allInstantBookings.filter(
      (b: InstantBooking) => b.customerId === user.id && b.status === 'accepted'
    );
    setAcceptedInstantBookings(myAcceptedBookings);

    // Load notifications
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const myNotifications = allNotifications
      .filter((n: any) => n.userId === user.id)
      .slice(0, 5);
    setNotifications(myNotifications);
  }, [user.id]);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const pendingSubscriptions = subscriptions.filter((s) => s.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl text-gray-800">Customer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Subscriptions</p>
                <p className="text-3xl text-blue-600 mt-2">{activeSubscriptions.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Requests</p>
                <p className="text-3xl text-yellow-600 mt-2">{pendingSubscriptions.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl text-green-600 mt-2">
                  ₹
                  {subscriptions
                    .filter((s) => s.paymentStatus === 'paid')
                    .reduce((sum, s) => sum + s.amount, 0)}
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate('browse-services')}
              className="flex flex-col items-center p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Search className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-blue-600">Browse Services</span>
            </button>

            <button className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <CreditCard className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-gray-600">Payment History</span>
            </button>

            <button className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <UserIcon className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-gray-600">My Profile</span>
            </button>

            <button className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-gray-600">Notifications</span>
            </button>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl mb-4 text-gray-800">My Active Subscriptions</h2>
          {activeSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {activeSubscriptions.map((sub) => (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg text-gray-800">{sub.serviceType}</h3>
                      <p className="text-gray-600">Provider: {sub.providerName}</p>
                      <p className="text-sm text-gray-500">
                        Plan: <span className="capitalize">{sub.plan}</span> | Started:{' '}
                        {new Date(sub.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl text-green-600">₹{sub.amount}</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mt-2">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No active subscriptions</p>
              <button
                onClick={() => onNavigate('browse-services')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Services
              </button>
            </div>
          )}
        </div>

        {/* Accepted Instant Bookings */}
        {acceptedInstantBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl mb-4 text-gray-800">Accepted Instant Bookings</h2>
            <div className="space-y-4">
              {acceptedInstantBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg text-gray-800">{booking.serviceType}</h3>
                      <p className="text-gray-600">Provider: {booking.providerName}</p>
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(booking.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl text-green-600">₹{booking.amount}</p>
                      {booking.paymentStatus === 'paid' ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mt-2">
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            localStorage.setItem('currentInstantBooking', JSON.stringify(booking));
                            onNavigate('payment-gateway');
                          }}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm mt-2"
                        >
                          Pay Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl mb-4 text-gray-800">Recent Notifications</h2>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                  <div>
                    <p className="text-gray-800">{notif.message}</p>
                    <p className="text-sm text-gray-500">{notif.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No new notifications</p>
          )}
        </div>
      </div>
    </div>
  );
}
