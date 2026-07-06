# BikeSense - The Intelligent Motorcycle Marketplace

BikeSense is a production-ready motorcycle marketplace platform equipped with AI-powered features, robust security, and real-time communication. It connects buyers, sellers, and dealers, ensuring transparent and secure transactions.

## Architecture & Tech Stack

BikeSense operates on a modern microservices architecture comprising three main components:

1.  **Frontend**: Angular 17+ (TypeScript) with Tailwind CSS and Angular Material. Provides separate dashboards for Buyers, Sellers, and Administrators.
2.  **Backend API**: ASP.NET Core 8 (C#). Handles business logic, JWT-based Authentication, Role-Based Access Control, and acts as an API Gateway.
3.  **ML Service**: Python FastAPI. Powers the intelligent features including price valuation and personalized recommendations.

## Features

-   **Marketplace & CRUD**: Full ecosystem for browsing, comparing, and listing motorcycles.
-   **AI Price Prediction & Valuation**: Get fair-market estimates, 3-year depreciation curves, and hidden cost calculators (fuel, maintenance, insurance).
-   **AI Recommendations**: Personalized bike recommendations based on budget, usage type, and brand preferences.
-   **Fraud Detection**: Automated flagging of suspicious listings (e.g., abnormally low prices, manipulated mileage).
-   **Security**: Secure JWT Authentication with Role-Based Access Control (Admin, Seller, Buyer, Dealer).
-   **Real-time Interaction**: Notifications and buyer-seller chat system using SignalR.

## Prerequisites

To run this project locally, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or higher) and npm
-   [Angular CLI](https://angular.io/cli)
-   [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
-   [Python 3.9+](https://www.python.org/)

## Getting Started

### 1. Start the ML Service (FastAPI)

The ML service handles the AI predictions. It runs on `http://localhost:8000`.

```bash
cd ml-service
python -m pip install -r requirements.txt
python -m uvicorn app:app --port 8000
```

### 2. Start the Backend API (ASP.NET Core)

The backend handles core logic and routes ML requests. It runs on `http://localhost:5073`.

```bash
cd backend/BikeSense.Api
dotnet restore
dotnet run
```

### 3. Start the Frontend (Angular)

The Angular frontend serves the user interfaces. It runs on `http://localhost:4200`.

```bash
cd frontend
npm install
npm start
```

## User Roles

The system is built around several user roles:
-   **Buyer**: Can browse, compare, run AI valuations, and chat with sellers.
-   **Seller**: Can add and manage motorcycle listings, and view performance analytics.
-   **Admin**: Can review reported users/listings, approve/reject suspicious listings, and view platform analytics.
-   **Dealer**: A premium seller role with advanced dealership metrics.

## Roadmap & Upcoming Features

-   [ ] Connect Frontend Chat UI to Backend SignalR Hubs.
-   [ ] Finalize JWT Interceptors on the Frontend.
-   [ ] Integrate Google OAuth for Social Login.
-   [ ] Implement Email Alerts.

## License
MIT License.
