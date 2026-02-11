import React, { useState } from 'react';
import { User } from '../App';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentGatewayProps {
  user: User;
  subscription: any;
  onSuccess: () => void;
  onBack: () => void;
}

export default function PaymentGateway({
  user,
  subscription,
  onSuccess,
  onBack,
}: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: '',
  });
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handlePayment = () => {
    // Validate payment details
    if (paymentMethod === 'upi' && !paymentDetails.upiId) {
      alert('Please enter UPI ID');
      return;
    }
    if (
      paymentMethod === 'card' &&
      (!paymentDetails.cardNumber || !paymentDetails.cardName || !paymentDetails.cardExpiry)
    ) {
      alert('Please fill all card details');
      return;
    }
    if (paymentMethod === 'netbanking' && !paymentDetails.bankName) {
      alert('Please select a bank');
      return;
    }

    // Simulate payment processing
    setProcessing(true);

    setTimeout(() => {
      // Simulate random success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        // Update subscription
        const updatedSubscription = {
          ...subscription,
          status: 'active',
          paymentStatus: 'paid',
        };

        // Save to localStorage
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        subscriptions.push(updatedSubscription);
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

        // Add notification for customer
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push({
          userId: user.id,
          message: `Subscription to ${subscription.serviceType} activated successfully!`,
          timestamp: new Date().toISOString(),
        });

        // Add notification for provider
        notifications.push({
          userId: subscription.providerId,
          message: `New subscription request from ${user.name} for ${subscription.serviceType}`,
          timestamp: new Date().toISOString(),
        });

        localStorage.setItem('notifications', JSON.stringify(notifications));

        // Calculate platform commission (10%)
        const platformCommission = subscription.amount * 0.1;
        const providerAmount = subscription.amount - platformCommission;

        // Record payment
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push({
          id: `payment-${Date.now()}`,
          subscriptionId: subscription.id,
          customerId: user.id,
          providerId: subscription.providerId,
          amount: subscription.amount,
          platformCommission,
          providerAmount,
          paymentMethod,
          timestamp: new Date().toISOString(),
          status: 'completed',
        });
        localStorage.setItem('payments', JSON.stringify(payments));

        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
      }
      setProcessing(false);
    }, 2000);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl mb-4 text-gray-800">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your subscription to {subscription.serviceType} has been activated successfully.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Transaction ID</span>
                <span className="text-gray-800">TXN{Date.now()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-gray-800">₹{subscription.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="text-gray-800 uppercase">{paymentMethod}</span>
              </div>
            </div>
            <button
              onClick={onSuccess}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl mb-4 text-gray-800">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              Sorry, your payment could not be processed. Please try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setPaymentStatus('idle');
                  setPaymentDetails({
                    upiId: '',
                    cardNumber: '',
                    cardName: '',
                    cardExpiry: '',
                    cardCvv: '',
                    bankName: '',
                  });
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Payment
              </button>
              <button
                onClick={onBack}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            disabled={processing}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl text-gray-800">Payment Gateway</h1>
          <p className="text-gray-600">Complete your payment securely</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl mb-4 text-gray-800">Select Payment Method</h2>
              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mr-3"
                    />
                    <span className="text-gray-800">UPI Payment</span>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mr-3"
                    />
                    <span className="text-gray-800">Debit/Credit Card</span>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'netbanking'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="mr-3"
                    />
                    <span className="text-gray-800">Net Banking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-gray-800">Enter Payment Details</h2>

              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm mb-2 text-gray-700">UPI ID</label>
                  <input
                    type="text"
                    value={paymentDetails.upiId}
                    onChange={(e) =>
                      setPaymentDetails({ ...paymentDetails, upiId: e.target.value })
                    }
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Card Number</label>
                    <input
                      type="text"
                      value={paymentDetails.cardNumber}
                      onChange={(e) =>
                        setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })
                      }
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Cardholder Name</label>
                    <input
                      type="text"
                      value={paymentDetails.cardName}
                      onChange={(e) =>
                        setPaymentDetails({ ...paymentDetails, cardName: e.target.value })
                      }
                      placeholder="Name on card"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Expiry Date</label>
                      <input
                        type="text"
                        value={paymentDetails.cardExpiry}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })
                        }
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">CVV</label>
                      <input
                        type="text"
                        value={paymentDetails.cardCvv}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })
                        }
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Select Bank</label>
                  <select
                    value={paymentDetails.bankName}
                    onChange={(e) =>
                      setPaymentDetails({ ...paymentDetails, bankName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose your bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="Axis">Axis Bank</option>
                    <option value="Kotak">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full mt-6 py-4 rounded-lg text-white transition-colors flex items-center justify-center ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₹{subscription.amount}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl mb-4 text-gray-800">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Service</p>
                  <p className="text-gray-800">{subscription.serviceType}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Provider</p>
                  <p className="text-gray-800">{subscription.providerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Plan</p>
                  <p className="text-gray-800 capitalize">{subscription.plan}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{subscription.amount}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="text-gray-800">₹0</span>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="text-lg text-gray-800">Total</span>
                  <span className="text-2xl text-blue-600">₹{subscription.amount}</span>
                </div>
              </div>
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">🔒 Secure Payment</p>
                <p className="text-xs text-green-700 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
