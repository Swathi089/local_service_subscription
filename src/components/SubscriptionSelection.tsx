import React, { useState } from 'react';
import { User, Service } from '../App';
import { ArrowLeft, Check, Calendar, CreditCard } from 'lucide-react';

interface SubscriptionSelectionProps {
  user: User;
  service: Service;
  onProceedToPayment: (subscription: any) => void;
  onBack: () => void;
}

export default function SubscriptionSelection({
  user,
  service,
  onProceedToPayment,
  onBack,
}: SubscriptionSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      duration: '1 Month',
      price: service.priceMonthly,
      savings: 0,
      description: 'Pay monthly, cancel anytime',
    },
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      duration: '3 Months',
      price: service.priceQuarterly,
      savings: service.priceMonthly * 3 - service.priceQuarterly,
      description: 'Save on 3-month subscription',
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      duration: '12 Months',
      price: service.priceAnnual,
      savings: service.priceMonthly * 12 - service.priceAnnual,
      description: 'Best value - maximum savings',
    },
  ];

  const handleProceed = () => {
    const subscription = {
      id: `sub-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      providerId: service.providerId,
      providerName: service.providerName,
      serviceType: service.serviceType,
      plan: selectedPlan,
      amount: plans.find((p) => p.id === selectedPlan)?.price || 0,
      startDate: new Date().toISOString(),
      status: 'pending',
      paymentStatus: 'pending',
    };

    onProceedToPayment(subscription);
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
          <h1 className="text-3xl text-gray-800">Select Subscription Plan</h1>
          <p className="text-gray-600">Choose the plan that works best for you</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Service Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl mb-4 text-gray-800">Service Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Service Type</p>
                <p className="text-lg text-gray-800">{service.serviceType}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Provider</p>
                <p className="text-lg text-gray-800">{service.providerName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Service Area</p>
                <p className="text-lg text-gray-800">{service.serviceArea}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <p className="text-lg text-gray-800">⭐ {service.rating}/5</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-800">{service.description}</p>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as any)}
                className={`bg-white rounded-lg shadow cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'ring-4 ring-blue-500 transform scale-105'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="p-6">
                  {selectedPlan === plan.id && (
                    <div className="flex justify-end mb-2">
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                  <h3 className="text-xl mb-2 text-gray-800">{plan.name}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{plan.duration}</span>
                  </div>
                  <p className="text-3xl text-blue-600 mb-2">₹{plan.price}</p>
                  {plan.savings > 0 && (
                    <p className="text-green-600 text-sm mb-4">Save ₹{plan.savings}</p>
                  )}
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl mb-4 text-gray-800">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Plan</span>
                <span className="text-gray-800 capitalize">{selectedPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="text-gray-800">
                  {plans.find((p) => p.id === selectedPlan)?.duration}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Charge</span>
                <span className="text-gray-800">
                  ₹{plans.find((p) => p.id === selectedPlan)?.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="text-gray-800">₹0</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg text-gray-800">Total Amount</span>
                <span className="text-2xl text-blue-600">
                  ₹{plans.find((p) => p.id === selectedPlan)?.price}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProceed}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Payment
          </button>

          {/* Terms */}
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> By proceeding, you agree to our terms and conditions. Your
              subscription will automatically renew unless cancelled before the renewal date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
