# ServiceMate 🛠️

**ServiceMate** is a premium, real-time local service booking platform designed to connect customers with local experts seamlessly. Built with a modern tech stack (MERN + Redis + Socket.io), it offers a production-ready mobile-first experience for managing home services, repairs, and professional consultations.

---

## ✨ Key Features

-   **Real-Time Booking Lifecycle**: Manage bookings from request to completion with real-time updates.
-   **Live Tracking & Geo-Search**: Discover nearby experts using a Map-based interface (Leaflet) and track their arrival in real-time.
-   **Integrated Chat**: Seamless communication between customers and providers via Socket.io.
-   **Secure Authentication**: Dual-role authentication (Customer/Provider) with JWT and Refresh Tokens.
-   **Provider Dashboard**: Sophisticated management of services, earnings, and availability.
-   **Premium UI/UX**: Apple-inspired minimalist design with Framer Motion animations and TailwindCSS.
-   **Secure Payments**: Integration-ready for Stripe/Razorpay.
-   **Cloud-Managed Media**: Professional image handling via Cloudinary.

---

## 🚀 Tech Stack

### **Frontend**
-   **React** (Vite)
-   **State Management**: Zustand & TanStack React Query
-   **Animations**: Framer Motion
-   **Styling**: TailwindCSS & Lucide icons
-   **Maps**: Leaflet & React-Leaflet
-   **Real-time**: Socket.io Client

### **Backend**
-   **Runtime**: Node.js / Express
-   **Database**: MongoDB (Mongoose)
-   **Caching/Store**: Redis
-   **File Storage**: Cloudinary
-   **Security**: Helmet, Express-Rate-Limit, Mongo-Sanitize, Bcryptjs
-   **Real-time Events**: Socket.io

---

## 🛠️ Project Structure

```bash
Booking Platform/
├── frontend/             # React application (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application screens
│   │   ├── api/          # Axios configuration and API calls
│   │   └── store/        # Zustand state management
├── backend/              # Express API
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── controllers/      # Business logic
│   ├── sockets/          # Socket.io event handlers
│   └── middleware/       # Auth & validation middleware
```

---

## ⚙️ Installation & Setup

### **Prerequisites**
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [MongoDB](https://www.mongodb.com/)
-   [Redis](https://redis.io/) (for real-time features)

---

### **1. Clone the repository**
```bash
git clone https://github.com/your-username/servicemate.git
cd servicemate
```

### **2. Backend Setup**
Navigate to the `backend` directory:
```bash
cd backend
npm install
```
Configure environment variables:
Create a `.env` file based on `.env.example` and add your credentials.
```bash
cp .env.example .env
```
Start the backend server:
```bash
node server.js
```

### **3. Frontend Setup**
Navigate to the `frontend` directory:
```bash
cd ../frontend
npm install
```
Configure environment variables:
```bash
cp .env.example .env
```
Start the development server:
```bash
npm run dev
```

---

## 🛡️ Environment Variables

The project requires several environment variables for full functionality:

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `REDIS_HOST` | Hostname for your Redis server |
| `CLOUDINARY_*` | Cloudinary credentials for image uploads |
| `NODEMAILER_*` | Credentials for automated emails |
| `STRIPE_SECRET_KEY` | Secret key for Stripe integration |

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for new features or improvements, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for a seamless service experience.*
