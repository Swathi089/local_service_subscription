<<<<<<< HEAD
# Local Service Subscription Platform

A comprehensive platform connecting customers with local service providers through subscription-based services.

## Features

### For Customers
- Browse and subscribe to local services
- Manage active subscriptions
- Secure payment processing
- Rate and review service providers
- Track service history

### For Service Providers
- Create and manage service offerings
- Handle service requests
- Track earnings and payments
- View customer feedback
- Manage availability

### For Administrators
- User management (customers & providers)
- Service approval and monitoring
- Payment and transaction oversight
- Generate reports and analytics
- Platform configuration

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design for mobile and desktop

**Backend:**
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- RESTful API architecture

**Payment Integration:**
- Stripe/PayPal integration ready

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd Local-Service-Subscription-Platform
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run the backend server**
```bash
npm start
# Development mode with auto-reload
npm run dev
```

6. **Access the application**
- Frontend: Open `frontend/pages/index.html` in your browser
- API: http://localhost:5000

## Project Structure

```
Local-Service-Subscription-Platform/
├── frontend/          # Client-side application
├── backend/           # Server-side application
├── docs/             # Documentation and diagrams
└── deployment/       # Deployment configurations
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request

### Customer Routes
- `GET /api/customer/services` - Browse services
- `POST /api/customer/subscribe` - Subscribe to service
- `GET /api/customer/subscriptions` - View subscriptions
- `POST /api/customer/review` - Submit review

### Provider Routes
- `POST /api/provider/service` - Create service
- `GET /api/provider/requests` - View service requests
- `PUT /api/provider/service/:id` - Update service
- `GET /api/provider/earnings` - View earnings

### Admin Routes
- `GET /api/admin/users` - Manage users
- `GET /api/admin/services` - Manage services
- `GET /api/admin/payments` - View payments
- `GET /api/admin/reports` - Generate reports

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/local-service-platform
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Payment Gateway
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Testing

```bash
cd backend
npm test
```

## Deployment

### Using Docker
```bash
docker build -t local-service-platform .
docker run -p 5000:5000 local-service-platform
```

### Using Replit
1. Import the repository to Replit
2. Configure environment variables
3. Run the application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@localserviceplatform.com or open an issue in the repository.

## Authors

- Your Name - Initial work

## Acknowledgments

- Thanks to all contributors
- Inspired by modern service marketplace platforms
=======
# subscription_service_platform
>>>>>>> 2b281e2cec91d014a449c40036e7d12b73b060ef
