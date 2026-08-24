# 💧 Racee Water - Water Can Delivery Management System

A full-stack modern web application for managing 20-liter water can deliveries, customer accounts, orders, empty can returns, payments, and automated WhatsApp communication.

---

## 🚀 Features

### 🌐 Customer Portal (Public)
- **💧 Online Booking:** 1-tap fast water can booking with real-time price calculations.
- **📱 WhatsApp Order Confirmation:** 1-click WhatsApp chat link with order summary.
- **ℹ️ About Us & Help:** Contact details, business location, operating hours, and FAQs.

### 👥 Owner / Admin Portal
- **📊 Business Dashboard:** Daily stats, total cans delivered, revenue collected, pending payments, and stock charts.
- **👥 Customer Directory:** Complete customer profiles, delivery addresses, order history, pending balances, and empty can tracking.
- **📲 WhatsApp Integration:** 1-click personalized WhatsApp welcome greetings, order status updates, and payment reminders.
- **📋 Order Management:** Real-time status tracker (Pending, Confirmed, Out for Delivery, Delivered, Cancelled).
- **💰 Payment & Can Return Logging:** Record cash/UPI payments and track empty cans returned vs pending.
- **📄 Reports & Exports:**
  - 📊 **Orders Excel Report (`.xlsx`)** with date range filtering.
  - 👥 **Customers Excel Report (`.xlsx`)** with total revenue and balances.
  - 📄 **PDF Reports:** Daily summary report, customer statement PDF, and orders PDF.
- **⚙️ Settings:** Real-time price per can configuration, company name, phone, and address settings.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router, Recharts, React Icons, Vanilla CSS Design System.
- **Backend:** Node.js, Express.js, MongoDB / Mongoose (with local store fallback), JWT Authentication, ExcelJS, PDFKit.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start Development Servers
```bash
# Run both Backend & Frontend simultaneously from root
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000`

---

## 👨‍💻 Developer
Developed with 💙 by **Tamilanbu** ([tamilanbu423@gmail.com](mailto:tamilanbu423@gmail.com))
