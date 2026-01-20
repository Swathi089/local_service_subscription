// Provider Portal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    auth.checkAuth();
    const user = auth.getUser();
    
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user?.name || 'Provider';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
        });
    }

    if (window.location.pathname.includes('dashboard.html')) {
        loadProviderDashboard();
    }

    if (window.location.pathname.includes('service-requests.html')) {
        loadServiceRequests();
        setupTabs();
    }

    if (window.location.pathname.includes('manage-services.html')) {
        loadProviderServices();
        setupServiceModal();
    }

    if (window.location.pathname.includes('earnings.html')) {
        loadEarnings();
        setupWithdrawalModal();
    }

    if (window.location.pathname.includes('profile.html')) {
        loadProviderProfile();
        setupProviderForms();
    }
});

async function loadProviderDashboard() {
    const stats = {
        activeClients: 12,
        pendingRequests: 3,
        monthlyEarnings: 3456.89,
        averageRating: 4.8
    };

    document.getElementById('activeClients').textContent = stats.activeClients;
    document.getElementById('pendingRequests').textContent = stats.pendingRequests;
    document.getElementById('monthlyEarnings').textContent = utils.formatCurrency(stats.monthlyEarnings);
    document.getElementById('averageRating').textContent = stats.averageRating.toFixed(1);

    loadUpcomingAppointments();
}

function loadUpcomingAppointments() {
    const mockAppointments = [
        {
            client: 'John Doe',
            service: 'Home Cleaning',
            date: '2024-01-20',
            time: '10:00 AM',
            status: 'Confirmed'
        }
    ];

    const tableBody = document.getElementById('upcomingAppointmentsTable');
    if (tableBody) {
        tableBody.innerHTML = mockAppointments.map(apt => `
            <tr>
                <td>${apt.client}</td>
                <td>${apt.service}</td>
                <td>${utils.formatDate(apt.date)}</td>
                <td>${apt.time}</td>
                <td><span class="status-badge status-active">${apt.status}</span></td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button>
                </td>
            </tr>
        `).join('');
    }
}

function loadServiceRequests() {
    const mockRequests = [
        {
            client: 'Sarah Johnson',
            service: 'Home Cleaning',
            requestedDate: '2024-01-25',
            location: '123 Main St',
            status: 'pending'
        }
    ];

    const tableBody = document.getElementById('pendingRequestsTable');
    if (tableBody) {
        tableBody.innerHTML = mockRequests.map(req => `
            <tr>
                <td>${req.client}</td>
                <td>${req.service}</td>
                <td>${utils.formatDate(req.requestedDate)}</td>
                <td>${req.location}</td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;">Accept</button>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Decline</button>
                </td>
            </tr>
        `).join('');
    }
}

function loadProviderServices() {
    const mockServices = [
        {
            id: 1,
            name: 'Weekly Home Cleaning',
            category: 'Cleaning',
            price: 49.99,
            duration: 2,
            active: true
        },
        {
            id: 2,
            name: 'Deep Cleaning',
            category: 'Cleaning',
            price: 89.99,
            duration: 4,
            active: true
        }
    ];

    const container = document.getElementById('servicesList');
    if (container) {
        container.innerHTML = mockServices.map(service => `
            <div class="service-item">
                <h3>${service.name}</h3>
                <p>Category: ${service.category}</p>
                <p>Price: ${utils.formatCurrency(service.price)}</p>
                <p>Duration: ${service.duration} hours</p>
                <p>Status: ${service.active ? 'Active' : 'Inactive'}</p>
                <div class="service-actions">
                    <button class="btn-primary" onclick="editService(${service.id})">Edit</button>
                    <button class="btn-secondary" onclick="toggleService(${service.id})">
                        ${service.active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function setupServiceModal() {
    const addServiceBtn = document.getElementById('addServiceBtn');
    const serviceModal = document.getElementById('serviceModal');
    const closeModal = serviceModal?.querySelector('.close');
    const serviceForm = document.getElementById('serviceForm');

    if (addServiceBtn && serviceModal) {
        addServiceBtn.addEventListener('click', function() {
            serviceModal.classList.add('show');
            document.getElementById('modalTitle').textContent = 'Add New Service';
            serviceForm.reset();
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                serviceModal.classList.remove('show');
            });
        }

        if (serviceForm) {
            serviceForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Service saved successfully!');
                serviceModal.classList.remove('show');
                loadProviderServices();
            });
        }
    }
}

function editService(serviceId) {
    alert(`Edit service ${serviceId}`);
}

function toggleService(serviceId) {
    alert(`Toggle service ${serviceId}`);
}

function loadEarnings() {
    const stats = {
        totalEarnings: 12456.78,
        thisMonth: 3456.89,
        pendingEarnings: 567.90,
        availableBalance: 2890.99
    };

    document.getElementById('totalEarnings').textContent = utils.formatCurrency(stats.totalEarnings);
    document.getElementById('thisMonth').textContent = utils.formatCurrency(stats.thisMonth);
    document.getElementById('pendingEarnings').textContent = utils.formatCurrency(stats.pendingEarnings);
    document.getElementById('availableBalance').textContent = utils.formatCurrency(stats.availableBalance);

    loadTransactionHistory();
}

function loadTransactionHistory() {
    const mockTransactions = [
        {
            date: '2024-01-15',
            client: 'John Doe',
            service: 'Home Cleaning',
            amount: 49.99,
            status: 'Completed'
        }
    ];

    const tableBody = document.getElementById('transactionHistoryTable');
    if (tableBody) {
        tableBody.innerHTML = mockTransactions.map(trans => `
            <tr>
                <td>${utils.formatDate(trans.date)}</td>
                <td>${trans.client}</td>
                <td>${trans.service}</td>
                <td>${utils.formatCurrency(trans.amount)}</td>
                <td><span class="payment-status payment-completed">${trans.status}</span></td>
            </tr>
        `).join('');
    }
}

function setupWithdrawalModal() {
    const withdrawBtn = document.getElementById('withdrawBtn');
    const withdrawalModal = document.getElementById('withdrawalModal');
    const closeModal = withdrawalModal?.querySelector('.close');
    const withdrawalForm = document.getElementById('withdrawalForm');

    if (withdrawBtn && withdrawalModal) {
        withdrawBtn.addEventListener('click', function() {
            withdrawalModal.classList.add('show');
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                withdrawalModal.classList.remove('show');
            });
        }

        if (withdrawalForm) {
            withdrawalForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Withdrawal request submitted!');
                withdrawalModal.classList.remove('show');
            });
        }
    }
}

function loadProviderProfile() {
    const user = auth.getUser();
    if (user) {
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('email').value = user.email || '';
    }
}

function setupProviderForms() {
    const forms = ['personalInfoForm', 'professionalForm', 'bankDetailsForm', 'changePasswordForm'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Changes saved successfully!');
            });
        }
    });
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