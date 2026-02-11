import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import CustomerRegister from './components/CustomerRegister';
import ProviderRegister from './components/ProviderRegister';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import BrowseServices from './components/BrowseServices';
import SubscriptionSelection from './components/SubscriptionSelection';
import PaymentGateway from './components/PaymentGateway';
import ServiceRequests from './components/ServiceRequests';
import ServiceManagement from './components/ServiceManagement';
import ServiceProviderDetails from './components/ServiceProviderDetails';
import InstantBookingRequests from './components/InstantBookingRequests';

export type UserRole = 'customer' | 'provider' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  address?: string;
  serviceType?: string;
  serviceArea?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  serviceArea: string;
  rating: number;
  priceMonthly: number;
  priceQuarterly: number;
  priceAnnual: number;
  description: string;
  available: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  plan: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  startDate: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
}

export interface InstantBooking {
  id: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'paid';
  paymentStatus: 'pending' | 'paid' | 'failed';
  description: string;
  images: string[];
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      if (user.role === 'customer') {
        setCurrentPage('customer-dashboard');
      } else if (user.role === 'provider') {
        setCurrentPage('provider-dashboard');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentPage('landing');
    setSelectedRole(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onSelectRole={(role) => {
              setSelectedRole(role);
            }}
            onNavigate={(page) => setCurrentPage(page)}
          />
        );
      case 'customer-register':
        return (
          <CustomerRegister
            onSuccess={() => setCurrentPage('login')}
            onBack={() => setCurrentPage('landing')}
          />
        );
      case 'provider-register':
        return (
          <ProviderRegister
            onSuccess={() => setCurrentPage('login')}
            onBack={() => setCurrentPage('landing')}
          />
        );
      case 'login':
        return (
          <Login
            selectedRole={selectedRole}
            onSuccess={(user) => {
              setCurrentUser(user);
              localStorage.setItem('currentUser', JSON.stringify(user));
              if (user.role === 'customer') {
                setCurrentPage('customer-dashboard');
              } else if (user.role === 'provider') {
                setCurrentPage('provider-dashboard');
              }
            }}
            onBack={() => setCurrentPage('landing')}
          />
        );
      case 'customer-dashboard':
        return (
          <CustomerDashboard
            user={currentUser!}
            onNavigate={(page) => setCurrentPage(page)}
            onLogout={handleLogout}
          />
        );
      case 'browse-services':
        return (
          <BrowseServices
            user={currentUser!}
            onSelectService={(service) => {
              setSelectedService(service);
              setCurrentPage('subscription-selection');
            }}
            onInstantBooking={(service, description = '', images = []) => {
              // Send instant booking request directly
              const instantBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
              const newBooking: InstantBooking = {
                id: `booking-${Date.now()}`,
                customerId: currentUser!.id,
                customerName: currentUser!.name,
                providerId: service.providerId,
                providerName: service.providerName,
                serviceType: service.serviceType,
                amount: service.priceMonthly, // Use monthly price as base
                requestDate: new Date().toISOString(),
                status: 'pending',
                paymentStatus: 'pending',
                description,
                images,
              };
              instantBookings.push(newBooking);
              localStorage.setItem('instantBookings', JSON.stringify(instantBookings));

              // Add notification to provider
              const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
              notifications.push({
                userId: service.providerId,
                message: `${currentUser!.name} has sent an instant booking request for ${service.serviceType}!`,
                timestamp: new Date().toLocaleString(),
              });
              localStorage.setItem('notifications', JSON.stringify(notifications));

              alert('Instant booking request sent successfully!');
              setCurrentPage('customer-dashboard');
            }}
            onBack={() => setCurrentPage('customer-dashboard')}
          />
        );
      case 'service-provider-details':
        return (
          <ServiceProviderDetails
            user={currentUser!}
            service={selectedService!}
            onBack={() => setCurrentPage('browse-services')}
            onSendRequest={(service, description = '', images = []) => {
              // Handle instant booking request
              const instantBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
              const newBooking: InstantBooking = {
                id: `booking-${Date.now()}`,
                customerId: currentUser!.id,
                customerName: currentUser!.name,
                providerId: service.providerId,
                providerName: service.providerName,
                serviceType: service.serviceType,
                amount: service.priceMonthly, // Use monthly price as base
                requestDate: new Date().toISOString(),
                status: 'pending',
                paymentStatus: 'pending',
                description,
                images,
              };
              instantBookings.push(newBooking);
              localStorage.setItem('instantBookings', JSON.stringify(instantBookings));

              // Add notification to provider
              const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
              notifications.push({
                userId: service.providerId,
                message: `${currentUser!.name} has sent an instant booking request for ${service.serviceType}!`,
                timestamp: new Date().toLocaleString(),
              });
              localStorage.setItem('notifications', JSON.stringify(notifications));
            }}
          />
        );
      case 'subscription-selection':
        return (
          <SubscriptionSelection
            user={currentUser!}
            service={selectedService!}
            onProceedToPayment={(subscription) => {
              setSelectedSubscription(subscription);
              setCurrentPage('payment-gateway');
            }}
            onBack={() => setCurrentPage('browse-services')}
          />
        );
      case 'payment-gateway':
        // Check if it's an instant booking payment
        const currentInstantBooking = localStorage.getItem('currentInstantBooking');
        if (currentInstantBooking) {
          const booking = JSON.parse(currentInstantBooking);
          return (
            <PaymentGateway
              user={currentUser!}
              subscription={booking}
              onSuccess={() => {
                // Update instant booking status to paid
                const allBookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
                const updatedBookings = allBookings.map((b: any) => {
                  if (b.id === booking.id) {
                    return { ...b, paymentStatus: 'paid' };
                  }
                  return b;
                });
                localStorage.setItem('instantBookings', JSON.stringify(updatedBookings));

                // Add notification to provider
                const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                notifications.push({
                  userId: booking.providerId,
                  message: `Instant booking payment received from ${currentUser!.name} for ${booking.serviceType}. Service scheduled.`,
                  timestamp: new Date().toLocaleString(),
                });
                localStorage.setItem('notifications', JSON.stringify(notifications));

                // Clear the current booking
                localStorage.removeItem('currentInstantBooking');
                setCurrentPage('customer-dashboard');
              }}
              onBack={() => setCurrentPage('customer-dashboard')}
            />
          );
        } else {
          return (
            <PaymentGateway
              user={currentUser!}
              subscription={selectedSubscription}
              onSuccess={() => setCurrentPage('customer-dashboard')}
              onBack={() => setCurrentPage('subscription-selection')}
            />
          );
        }
      case 'provider-dashboard':
        return (
          <ProviderDashboard
            user={currentUser!}
            onNavigate={(page) => setCurrentPage(page)}
            onLogout={handleLogout}
          />
        );
      case 'service-requests':
        return (
          <ServiceRequests
            user={currentUser!}
            onBack={() => setCurrentPage('provider-dashboard')}
          />
        );
      case 'service-management':
        return (
          <ServiceManagement
            user={currentUser!}
            onBack={() => setCurrentPage('provider-dashboard')}
          />
        );
      case 'instant-booking-requests':
        return (
          <InstantBookingRequests
            user={currentUser!}
            onBack={() => setCurrentPage('provider-dashboard')}
          />
        );
      default:
        return <LandingPage onSelectRole={setSelectedRole} onNavigate={setCurrentPage} />;
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderPage()}</div>;
}

export default App;
