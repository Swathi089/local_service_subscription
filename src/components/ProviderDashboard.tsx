import React, { useState, useEffect } from 'react';
import { User, InstantBooking } from '../App';
import {
  DollarSign,
  Users,
  Bell,
  LogOut,
  Settings,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface ProviderDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function ProviderDashboard({
  user,
  onNavigate,
  onLogout,
}: ProviderDashboardProps) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [instantBookings, setInstantBookings] = useState<InstantBooking[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Load provider's subscriptions
    const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const mySubscriptions = allSubscriptions.filter((s: any) => s.providerId === user.id);
    setSubscriptions(mySubscriptions);

    // Load instant bookings
    const allInstantBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
    const myInstantBookings = allInstantBookings.filter((b: InstantBooking) => b.providerId === user.id);
    setInstantBookings(myInstantBookings);

    // Calculate earnings (90% after 10% platform commission)
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const myPayments = payments.filter((p: any) => p.providerId === user.id);
    const totalEarnings = myPayments.reduce((sum: number, p: any) => sum + p.providerAmount, 0);
    setEarnings(totalEarnings);

    // Load notifications
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const myNotifications = allNotifications
      .filter((n: any) => n.userId === user.id)
      .slice(0, 5);
    setNotifications(myNotifications);
  }, [user.id]);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const pendingRequests = subscriptions.filter((s) => s.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl text-gray-800">Service Provider Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
              <p className="text-sm text-gray-500">
                {user.serviceType} | {user.serviceArea}
              </p>
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-3xl text-green-600 mt-2">₹{earnings}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Customers</p>
                <p className="text-3xl text-blue-600 mt-2">{activeSubscriptions.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Requests</p>
                <p className="text-3xl text-yellow-600 mt-2">{pendingRequests.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Service Rating</p>
                <p className="text-3xl text-purple-600 mt-2">4.5</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate('service-requests')}
              className="flex flex-col items-center p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Bell className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-green-600">View Requests</span>
              {pendingRequests.length > 0 && (
                <span className="mt-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {pendingRequests.length} New
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('instant-booking-requests')}
              className="flex flex-col items-center p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Clock className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-blue-600">Instant Bookings</span>
              {instantBookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="mt-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {instantBookings.filter(b => b.status === 'pending').length} New
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('service-management')}
              className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-gray-600">Manage Service</span>
            </button>

            <button className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-gray-600">Earnings Report</span>
            </button>

            <button className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-gray-600">My Customers</span>
            </button>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl mb-4 text-gray-800">Active Customer Subscriptions</h2>
          {activeSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {activeSubscriptions.map((sub) => (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg text-gray-800">{sub.customerName}</h3>
                      <p className="text-gray-600">Plan: <span className="capitalize">{sub.plan}</span></p>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(sub.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl text-green-600">₹{sub.amount}</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mt-2">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No active subscriptions yet</p>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl mb-4 text-gray-800">Recent Notifications</h2>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif, index) => (
                <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                  <Bell className="w-5 h-5 text-green-500 mr-3 mt-1" />
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
