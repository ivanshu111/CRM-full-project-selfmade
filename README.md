# CRM Project - Frontend Documentation

This document provides an overview of the frontend part of our Customer Relationship Management (CRM) system. It is designed to be simple.

## 🚀 Overview
The frontend is a modern, responsive web application built using **React**. It serves as the user interface for employees and admins to manage customers, leads, and interactions.

---

## 🛠 Tech Stack
We have used the following technologies to build the frontend:

- **React 19**: A JavaScript library for building user interfaces using components.
- **Vite**: A fast build tool that provides a smooth development experience.
- **Tailwind CSS 4**: A utility-first CSS framework used for rapid and modern UI styling.
- **React Router Dom**: For handling navigation and routing between different pages.
- **Axios**: A promise-based HTTP client for making API calls to our Spring Boot backend.
- **Recharts**: A composable charting library used to display data visualizations on the dashboard.
- **React Hot Toast**: For providing beautiful and responsive notifications (success/error messages).

---

## 📂 Project Structure
The `frontend/CRM/src` folder is organized as follows:

- **`api/`**: Contains Axios configuration and API service functions for communicating with the backend.
- **`components/`**: Reusable UI components like Modals and Protected Routes.
- **`context/`**: Contains `AuthContext` to manage user authentication state globally.
- **`pages/`**: Contains the main pages of the application:
  - `auth/`: Login and Registration forms.
  - `dashboard/`: Overview of the system with charts.
  - `customers/`: Customer management and interaction forms.
- **`routers/`**: Defines the application's routes and access controls.

---

## ✨ Key Features

### 1. Authentication & Security
- **JWT Authentication**: We use JSON Web Tokens (JWT) for secure communication.
- **Protected Routes**: Certain pages (like the Dashboard) are only accessible to logged-in users.
- **Role-Based Access**: The registration page is restricted to **ADMIN** users only.

### 2. Dashboard
- Displays a visual summary of leads and customers using **Recharts**.
- Provides a quick glance at the system's performance.

### 3. Customer Management
- Add and view customer details.
- Track interactions (calls, emails, meetings) with each customer.

### 4. Responsive Design
- Built with **Tailwind CSS**, ensuring the application looks great on both desktops and mobile devices.

---

## 🔄 Data Flow (Architecture)
The application follows a unidirectional data flow from the UI to the backend:

1.  **User Input**: User enters data in a form (e.g., Login).
2.  **API Service**: The request is passed to an `api` function (e.g., `loginUser`).
3.  **Axios Interceptor**: Before the request leaves, a "Global Interceptor" attaches the **JWT Token** from `localStorage`.
4.  **Backend Response**: Spring Boot processes the request and sends back JSON data.
5.  **State Management**: The data is stored in **React Context** (`AuthContext`) or local component state, triggering a UI re-render.

### 📝 Code Snippet: Axios Interceptor
```javascript
// src/api/axios.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Automatically secure every request
  }
  return config;
});
```

---

## 📊 Dashboard Deep Dive

The Dashboard is dynamic and changes its UI based on the user's role (**ADMIN** or **EMPLOYEE**).

### 1. Admin Dashboard
The Admin view is focused on "System Overview" and "Team Performance".
-   **System Stats**: Fetches global counts for customers, total leads, and conversion rates.
-   **Analytics**: Uses `Recharts` to show a breakdown of lead statuses (New, Interested, Closed, etc.).
-   **Employee Management**: Admins can see a list of all employees and their individual performance (Star Employee).

```javascript
// Role-based data fetching in Dashboard.jsx
if (user.role === "ADMIN") {
  Promise.all([
    getCustomerCount(),
    getLeadsCount(),
    getBestEmployee(),
  ]).then(([cust, leads, best]) => {
    setStats({ customers: cust.data, leads: leads.data, bestEmployee: best.data });
  });
}
```

### 2. Employee Dashboard
The Employee view is focused on "Personal Task Management".
-   **My Customers**: Shows only the customers assigned to the logged-in employee.
-   **Categorization**: Customers are automatically split into **Interested** and **Not Interested** columns for quick follow-ups.
-   **Interaction History**: Employees can log calls/emails and view the entire history of a customer with one click.

```javascript
// Employee-specific view snippet
{user.role === "EMPLOYEE" && (
  <div className="grid grid-cols-2 gap-6">
    <CustomerList title="Interested" data={interestedCustomers} />
    <CustomerList title="Not Interested" data={notInterestedCustomers} />
  </div>
)}
```

---

## ⚙️ How to Run
1. Navigate to the frontend directory:
   ```bash
   cd frontend/CRM
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔌 API Integration
The frontend connects to the backend at `http://localhost:8080`. It uses an **Axios Interceptor** to automatically attach the JWT token to every request after the user logs in.
