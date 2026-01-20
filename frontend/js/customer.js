// Customer Portal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    auth.checkAuth();
    const user = auth.getUser();
    
    // Set user name in sidebar
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user?.name || 'Customer';
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
        });
    }

    // Dashboard Page
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardData();
    }

    // Browse Services Page
    if (window.location.pathname.includes('browse-services.html')) {
        loadServices();
        setupFilters();
    }

    // Subscriptions Page
    if (window.location.pathname.includes('subscriptions.html')) {
        loadSubscriptions();
        setupTabs();
    }

    // Feedback Page
    if (window.location.pathname.includes('feedback.html')) {
        loadReviews();
        setupReviewModal();
    }

    // Profile Page
    if (window.location.pathname.includes('profile.html')) {
        loadProfile();
        setupProfileForms();
    }
});

// Dashboard Functions
async function loadDashboardData() {
    // Mock dashboard data
    const stats = {
        activeSubscriptions: 3,
        upcomingServices: 5,
        monthlySpend: 237.97,
        pendingReviews: 2
    };

    document.getElementById('activeSubscriptions').textContent = stats.activeSubscriptions;
    document.getElementById('upcomingServices').textContent = stats.upcomingServices;
    document.getElementById('monthlySpend').textContent = utils.formatCurrency(stats.monthlySpend);
    document.getElementById('pendingReviews').textContent = stats.pendingReviews;

    // Load upcoming services
    loadUpcomingServices();
}

function loadUpcomingServices() {
    const mockServices = [
        {
            service: 'Home Cleaning',
            provider: 'Clean Pro',
            date: '2024-01-20',
            time: '10:00 AM',
            status: 'Confirmed'
        },
        {
            service: 'Plumbing Check',
            provider: 'Fix It Fast',
            date: '2024-01-22',
            time: '2:00 PM',
            status: 'Confirmed'
        }
    ];

    const tableBody = document.getElementById('upcomingServicesTable');
    if (tableBody) {
        tableBody.innerHTML = mockServices.map(service => `
            <tr>
                <td>${service.service}</td>
                <td>${service.provider}</td>
                <td>${utils.formatDate(service.date)}</td>
                <td>${service.time}</td>
                <td><span class="status-badge status-active">${service.status}</span></td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Details</button>
                </td>
            </tr>
        `).join('');
    }
}

// Browse Services Functions
async function loadServices() {
    const services = await api.getServices();
    const grid = document.getElementById('servicesGrid');
    
    if (grid && services.length) {
        grid.innerHTML = services.map(service => `
            <div class="service-card">
                <div class="service-icon">${getCategoryIcon(service.category)}</div>
                <h3>${service.name}</h3>
                <p class="provider">${service.provider}</p>
                <p class="description">${service.description}</p>
                <div class="service-details">
                    <span class="price">${utils.formatCurrency(service.price)}/visit</span>
                    <span class="rating">⭐ ${service.rating}</span>
                </div>
                <button class="btn-primary btn-full" onclick="viewService(${service.id})">View Details</button>
            </div>
        `).join('');
    }
}

function getCategoryIcon(category) {
    const icons = {
        cleaning: '🏠',
        plumbing: '🔧',
        electrical: '⚡',
        gardening: '🌿',
        carpentry: '🔨',
        painting: '🎨'
    };
    return icons[category] || '🔧';
}

function viewService(serviceId) {
    // Show service detail modal
    alert(`View details for service ${serviceId}`);
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const ratingFilter = document.getElementById('ratingFilter');

    [searchInput, categoryFilter, priceFilter, ratingFilter].forEach(element => {
        if (element) {
            element.addEventListener('change', loadServices);
        }
    });
}

// Subscriptions Functions
async function loadSubscriptions() {
    const mockSubscriptions = [
        {
            service: 'Weekly Home Cleaning',
            provider: 'Clean Pro',
            plan: 'Premium',
            nextVisit: '2024-01-20',
            status: 'active'
        }
    ];

    const container = document.getElementById('activeSubscriptions');
    if (container) {
        container.innerHTML = mockSubscriptions.map(sub => `
            <div class="subscription-card">
                <h3>${sub.service}</h3>
                <p>Provider: ${sub.provider}</p>
                <p>Plan: ${sub.plan}</p>
                <p>Next Visit: ${utils.formatDate(sub.nextVisit)}</p>
                <div class="subscription-actions">
                    <button class="btn-secondary">Pause</button>
                    <button class="btn-primary">Manage</button>
                </div>
            </div>
        `).join('');
    }
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// Review Functions
function loadReviews() {
    // Load pending and submitted reviews
}

function setupReviewModal() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            ratingInput.value = rating;
            
            stars.forEach(s => {
                if (s.dataset.rating <= rating) {
                    s.textContent = '★';
                } else {
                    s.textContent = '☆';
                }
            });
        });
    });

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Review submitted successfully!');
            // Close modal and refresh
        });
    }
}

// Profile Functions
function loadProfile() {
    const user = auth.getUser();
    if (user) {
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('email').value = user.email || '';
    }
}

function setupProfileForms() {
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Profile updated successfully!');
        });
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            alert('Password changed successfully!');
            changePasswordForm.reset();
        });
    }
}