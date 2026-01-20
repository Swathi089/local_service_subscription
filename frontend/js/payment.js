// Payment JavaScript
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('payment.html')) {
        loadPaymentMethods();
        loadPaymentHistory();
        setupPaymentModal();
    }
});

function loadPaymentMethods() {
    const mockPaymentMethods = [
        {
            id: 1,
            type: 'Visa',
            last4: '4242',
            expiry: '12/25',
            isDefault: true
        },
        {
            id: 2,
            type: 'Mastercard',
            last4: '8888',
            expiry: '06/26',
            isDefault: false
        }
    ];

    const container = document.getElementById('paymentMethodsList');
    if (container) {
        container.innerHTML = mockPaymentMethods.map(method => `
            <div class="payment-method-card">
                <div class="payment-method-info">
                    <div class="card-icon">💳</div>
                    <div class="card-details">
                        <h4>
                            ${method.type} •••• ${method.last4}
                            ${method.isDefault ? '<span class="card-badge">Default</span>' : ''}
                        </h4>
                        <p>Expires ${method.expiry}</p>
                    </div>
                </div>
                <div class="payment-method-actions">
                    ${!method.isDefault ? '<button class="btn-icon" title="Set as default">⭐</button>' : ''}
                    <button class="btn-icon" title="Delete" onclick="deletePaymentMethod(${method.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }
}

function loadPaymentHistory() {
    const mockHistory = [
        {
            date: '2024-01-15',
            description: 'Weekly Home Cleaning',
            amount: 49.99,
            status: 'Completed'
        },
        {
            date: '2024-01-08',
            description: 'Plumbing Service',
            amount: 89.99,
            status: 'Completed'
        },
        {
            date: '2024-01-01',
            description: 'Monthly Subscription',
            amount: 79.99,
            status: 'Completed'
        }
    ];

    const tableBody = document.getElementById('paymentHistoryTable');
    if (tableBody) {
        tableBody.innerHTML = mockHistory.map(payment => `
            <tr>
                <td>${utils.formatDate(payment.date)}</td>
                <td>${payment.description}</td>
                <td>${utils.formatCurrency(payment.amount)}</td>
                <td><span class="payment-status payment-completed">${payment.status}</span></td>
                <td><button class="btn-invoice">Download Invoice</button></td>
            </tr>
        `).join('');
    }
}

function setupPaymentModal() {
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    const paymentModal = document.getElementById('paymentModal');
    const closeModal = paymentModal?.querySelector('.close');
    const paymentMethodForm = document.getElementById('paymentMethodForm');

    if (addPaymentBtn && paymentModal) {
        addPaymentBtn.addEventListener('click', function() {
            paymentModal.classList.add('show');
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                paymentModal.classList.remove('show');
            });
        }

        window.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                paymentModal.classList.remove('show');
            }
        });
    }

    if (paymentMethodForm) {
        const cardNumberInput = document.getElementById('cardNumber');
        const expiryDateInput = document.getElementById('expiryDate');
        const cvvInput = document.getElementById('cvv');

        // Card number formatting
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue.substring(0, 19);
            });
        }

        // Expiry date formatting
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV formatting
        if (cvvInput) {
            cvvInput.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
            });
        }

        paymentMethodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const cardNumber = cardNumberInput.value.replace(/\s/g, '');
            if (cardNumber.length !== 16) {
                alert('Please enter a valid 16-digit card number');
                return;
            }

            const expiryDate = expiryDateInput.value;
            if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
                alert('Please enter a valid expiry date (MM/YY)');
                return;
            }

            const cvv = cvvInput.value;
            if (cvv.length !== 3) {
                alert('Please enter a valid 3-digit CVV');
                return;
            }

            alert('Payment method added successfully!');
            paymentModal.classList.remove('show');
            paymentMethodForm.reset();
            loadPaymentMethods();
        });
    }
}

function deletePaymentMethod(methodId) {
    if (confirm('Are you sure you want to delete this payment method?')) {
        alert('Payment method deleted');
        loadPaymentMethods();
    }
}