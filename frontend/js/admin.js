// Admin Portal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    auth.checkAuth();
    const user = auth.getUser();
    
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user?.name || 'Administrator';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
        });
    }

    if (window.location.pathname.includes('dashboard.html')) {
        loadAdminDashboard();
    }

    if (window.location.pathname.includes('manage-users.html')) {
        loadUsers();
    }

    if (window.location.pathname.includes('manage-services.html')) {
        loadAdminServices();
    }

    if (window.location.pathname.includes('manage-payments.html')) {
        loadPayments();
    }

    if (window.location.pathname.includes('reports.html')) {
        loadReports();
    }
});

async function loadAdminDashboard() {
    const stats = {
        totalUsers: 1234,
        activeProviders: 156,
        activeSubscriptions: 789,
        monthlyRevenue: 45678.90
    };

    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeProviders').textContent = stats.activeProviders;
    document.getElementById('activeSubscriptions').textContent = stats.activeSubscriptions;
    document.getElementById('monthlyRevenue').textContent = utils.formatCurrency(stats.monthlyRevenue);

    loadRecentRegistrations();
}

function loadRecentRegistrations() {
    const mockRegistrations = [
        {
            name: 'John Smith',
            email: 'john@example.com',
            role: 'Customer',
            date: '2024-01-18',
            status: 'Active'
        },
        {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'Provider',
            date: '2024-01-17',
            status: 'Pending'
        }
    ];

    const tableBody = document.getElementById('recentRegistrationsTable');
    if (tableBody) {
        tableBody.innerHTML = mockRegistrations.map(reg => `
            <tr>
                <td>${reg.name}</td>
                <td>${reg.email}</td>
                <td>${reg.role}</td>
                <td>${utils.formatDate(reg.date)}</td>
                <td><span class="status-badge status-${reg.status.toLowerCase()}">${reg.status}</span></td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button>
                </td>
            </tr>
        `).join('');
    }
}

function loadUsers() {
    // Implementation for manage users page
    console.log('Loading users...');
}

function loadAdminServices() {
    // Implementation for manage services page
    console.log('Loading admin services...');
}

function loadPayments() {
    // Implementation for manage payments page
    console.log('Loading payments...');
}

function loadReports() {
    // Implementation for reports page
    console.log('Loading reports...');
}