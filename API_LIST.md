# Backend API List

This document lists all the backend API endpoints and their usage status in the frontend.

## Authentication APIs (`/auth`)

| Method | Endpoint         | Status  | Used in Frontend |
| ------ | ---------------- | ------- | ---------------- |
| POST   | `/auth/signin`   | ✅ Used | `authApi.js`     |
| POST   | `/auth/register` | ✅ Used | `authApi.js`     |
| GET    | `/auth/profile`  | ✅ Used | `authApi.js`     |

## Admin APIs (`/api/admin`)

| Method | Endpoint                               | Status    | Used in Frontend |
| ------ | -------------------------------------- | --------- | ---------------- |
| GET    | `/api/admin/employees`                 | ✅ Used   | `adminApi.js`    |
| GET    | `/api/admin/employees/{id}`            | ✅ Used   | `EmployeeDetails.jsx` |
| GET    | `/api/admin/customers`                 | ✅ Used   | `adminApi.js`    |
| GET    | `/api/admin/employee/{id}/customers`   | ✅ Used   | `EmployeeDetails.jsx` |
| GET    | `/api/admin/interactions`              | ✅ Used   | `adminApi.js`    |
| GET    | `/api/admin/leads/count`               | ✅ Used   | `adminApi.js`    |
| GET    | `/api/admin/leads/closed`              | ✅ Used   | `adminApi.js`    |
| GET    | `/api/admin/analytics/conversion-rate` | ✅ Used   | `Dashboard.jsx`  |
| GET    | `/api/admin/analytics/lead-status-breakdown` | ✅ Used | `Dashboard.jsx`  |
| GET    | `/api/admin/analytics/best-employee`   | ✅ Used   | `adminApi.js`    |

## Customer APIs (`/api/customers`)

| Method | Endpoint                        | Status  | Used in Frontend |
| ------ | ------------------------------- | ------- | ---------------- |
| POST   | `/api/customers`                | ✅ Used | `employeeApi.js` |
| GET    | `/api/customers/my`             | ✅ Used | `employeeApi.js` |
| GET    | `/api/customers/interested`     | ✅ Used | `Dashboard.jsx` |
| GET    | `/api/customers/not-interested` | ✅ Used | `Dashboard.jsx` |
| GET    | `/api/customers/closed`         | ✅ Used | `employeeApi.js` |
| GET    | `/api/customers/pending`        | ✅ Used | `employeeApi.js` |
| GET    | `/api/customers/{id}`           | ✅ Used | `CustomerDetails.jsx` |
| PUT    | `/api/customers/{id}`           | ✅ Used | `employeeApi.js` |

## Dashboard APIs (`/api/dashboard`)

| Method | Endpoint                         | Status  | Used in Frontend |
| ------ | -------------------------------- | ------- | ---------------- |
| GET    | `/api/dashboard/customers/count` | ✅ Used | `adminApi.js`    |

## Interaction APIs (`/api/interaction`)

| Method | Endpoint                         | Status  | Used in Frontend |
| ------ | -------------------------------- | ------- | ---------------- |
| POST   | `/api/interaction`               | ✅ Used | `AddInteractionForm.jsx` |
| GET    | `/api/interaction/customer/{id}` | ✅ Used | `CustomerDetails.jsx`, `InteractionHistory.jsx` |

## Lead APIs (`/api/leads`)

| Method | Endpoint                         | Status  | Used in Frontend |
| ------ | -------------------------------- | ------- | ---------------- |
| PUT    | `/api/leads/{customerId}/status` | ✅ Used | `employeeApi.js` |

---

## Summary of Unused APIs

All implemented backend endpoints are currently utilized by the frontend.
