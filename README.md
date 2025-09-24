# TabHQ

**TabHQ** is a modular backend service for managing applications, users, and payments across multiple providers. It is designed to be extensible, secure, and developer-friendly, making it easier to integrate different payment solutions (e.g., Flutterwave, PayPal, Mobile Money) into your apps.

## ✨ Features

-  **Authentication & Invites** – Manage users and invitations with JWT-based authentication
-  **Apps Management** – Create and configure apps linked to your workspace
-  **Payments API** – Unified interface to initiate, capture, refund, and verify payments
-  **Multiple Payment Providers** – Support for Flutterwave, PayPal, Mobile Money, and more (plug-in providers easily)
-  **Secure by default** – Helmet, CORS, and signature verification for webhooks
-  **Extensible Provider System** – Add new providers by extending a simple `BaseProvider` class

## 🛠️ Tech Stack

- **Node.js + TypeScript** – Core backend framework
- **Express** – REST API
- **Winston** – Structured logging

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18)
- npm or yarn
- (Optional) Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/yaasiin-ayeva/tabhq.git
cd tabhq

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Running the Server

```bash
npm run dev
```

By default, the server will start on **http://localhost:3000**.

## 🔧 Configuration

Update your `.env` file with the required keys:

```env
PORT=3000

# Auth
JWT_SECRET=your_jwt_secret
```

## 📡 API Overview

### Authentication
- `POST /auth/login` – User login
- `POST /auth/register` – Create new account

### Apps
- `GET /apps` – List apps
- `POST /apps` – Create new app

### Configure Providers
- `POST /payment-config/:appId/providers` – Configure a payment provider
- `PUT /payment-config/:appId/providers/:provider` – Update a payment provider
- `GET /payment-config/:appId/providers` – List payment providers for an app
- `GET /payment-config/:appId/providers/:provider` – Get a payment provider for an app

### Payments
- `POST /payments` – Initiate a payment
- `GET /payments/:id` – Check payment status
- `POST /payments/:id/refund` – Refund a payment

Example request to create a Flutterwave Mobile Money payment:

```json
{
  "provider": "flutterwave",
  "amount": 50,
  "currency": "GHS",
  "metadata": {
    "country": "ghana",
    "network": "MTN",
    "customerName": "John Doe",
    "customerEmail": "john.doe@example.com",
    "phoneNumber": "233595056253"
  }
}
```

## 📜 License

MIT License.

## 🤝 Contributing

Contributions are welcome!

- Open an issue for bug reports or feature requests
- Fork the repo and submit a PR for fixes and improvements
