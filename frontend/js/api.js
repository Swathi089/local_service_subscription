// API Configuration and Helper Functions
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL

// API Helper Functions
const api = {
    // Authentication with OTP
    async sendLoginOTP(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            return await response.json();
        } catch (error) {
            console.error('Send OTP error:', error);
            throw error;
        }
    },

    async verifyLoginOTP(email, otp) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            return await response.json();
        } catch (error) {
            console.error('Verify OTP error:', error);
            throw error;
        }
    },

    async sendRegistrationOTP(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-registration-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Send registration OTP error:', error);
            throw error;
        }
    },

    async verifyRegistrationOTP(email, otp, userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, userData })
            });
            return await response.json();
        } catch (error) {
            console.error('Verify registration OTP error:', error);
            throw error;
        }
    },

    async googleSignIn(credential) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google-signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential })
            });
            return await response.json();
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    },

    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            return await response.json();
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    async resendOTP(email, type = 'login') {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type })
            });
            return await response.json();
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    },

    // Services
    async getServices(filters = {}) {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_BASE_URL}/services?${query}`, {
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get services error:', error);
            return this.mockServices();
        }
    },

    async getServiceById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/services/${id}`, {
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get service error:', error);
            return null;
        }
    },

    // Subscriptions
    async getSubscriptions(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get subscriptions error:', error);
            return [];
        }
    },

    // Mock data for development
    mockServices() {
        return [
            {
                id: 1,
                name: 'Weekly Home Cleaning',
                category: 'cleaning',
                provider: 'Clean Pro Services',
                price: 49.99,
                rating: 4.8,
                description: 'Professional home cleaning service',
                duration: 2
            },
            {
                id: 2,
                name: 'Emergency Plumbing',
                category: 'plumbing',
                provider: 'Fix It Fast',
                price: 89.99,
                rating: 4.9,
                description: '24/7 plumbing services',
                duration: 1.5
            },
            {
                id: 3,
                name: 'Electrical Installation',
                category: 'electrical',
                provider: 'Bright Solutions',
                price: 69.99,
                rating: 4.7,
                description: 'Licensed electrician services',
                duration: 2
            }
        ];
    }
};

// Storage Helper Functions
const storage = {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    }
};

// Auth Helper Functions
const auth = {
    setUser(user, token) {
        storage.set('user', user);
        storage.set('token', token);
    },

    getUser() {
        return storage.get('user');
    },

    getToken() {
        return storage.get('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    logout() {
        storage.clear();
        window.location.href = '../pages/login.html';
    },

    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '../pages/login.html';
        }
    }
};

// Utility Functions
const utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    showNotification(message, type = 'success') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const re = /^\+?[\d\s\-\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }
};
const API_BASE = "http://localhost:5000/api";

async function apiRequest(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
        ? `Bearer ${localStorage.getItem("token")}`
        : ""
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API Error");
  }

  return result;
}
