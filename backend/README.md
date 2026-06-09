# CRM - Customer Relationship Management System

A simple Spring Boot application to manage customers and their interactions.

## Project Overview
This project is a CRM system where **ADMIN** and **EMPLOYEE** can manage customer data. It uses JWT-based authentication to secure the APIs.

## Tech Stack
- **Backend:** Java, Spring Boot, Spring Security (JWT), Spring Data JPA
- **Database:** MySQL
- **Build Tool:** Maven

## Key Features
- **Secure Authentication:** Users can login and get a JWT token.
- **Role-Based Access:** 
    - `ADMIN`: Can register new users (Employees/Admins), add/manage all customers, and assign them to employees.
    - `EMPLOYEE`: Can add customers for themselves, fetch their own assigned customers, and record interactions.
- **Customer Management:** Fetch and update customer details with strict ownership checks.
- **Automatic Lead Creation:** When a new customer is registered, a corresponding lead record with status `PENDING` is automatically created in the `leads` table.
- **Robust Status Handling:** Database columns for `status` are optimized (VARCHAR 20) to handle all enum values without truncation issues.
- **Dashboard Statistics:** Admins and Employees can fetch their respective total customer counts.
- **Lead Status Tracking:** Each customer response now includes their current status (e.g., `PENDING`, `INTERESTED`, `CONTACTED`, etc.) from the most recent lead record.
- **Interaction Tracking:** Record notes and follow-up dates for specific customers.
- **Global Exception Handling:** Clean, JSON-based error responses for all system exceptions.

## API Documentation

This section provides a detailed guide to all API endpoints available in the CRM system, including request and response formats with JSON examples.

---

### 1. Authentication APIs (`/auth`)

#### **Sign In**
- **Endpoint:** `POST /auth/signin`
- **Description:** Authenticates a user and returns a JWT token for subsequent requests.
- **Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
- **Response Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ROLE_ADMIN"
}
```

#### **Register User**
- **Endpoint:** `POST /auth/register`
- **Description:** Registers a new user (Admin or Employee). Only accessible by users with the `ADMIN` role.
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePass123",
  "role": "EMPLOYEE"
}
```
- **Response Body:**
```text
User registered successfully!
```

#### **Get Profile**
- **Endpoint:** `GET /auth/profile`
- **Description:** Retrieves the profile information of the currently logged-in user.
- **Response Body:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "ADMIN",
  "createdAt": "2026-05-02T10:00:00"
}
```

---

### 2. Admin APIs (`/api/admin`)
*All endpoints in this section require `ADMIN` role.*

#### **List All Employees**
- **Endpoint:** `GET /api/admin/employees`
- **Description:** Returns a list of all registered employees.
- **Response Body:**
```json
[
  {
    "id": 2,
    "name": "John Employee",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "created_at": "2026-05-01 12:00:00"
  }
]
```

#### **Get Employee by ID**
- **Endpoint:** `GET /api/admin/employees/{id}`
- **Description:** Retrieves details of a specific employee.
- **Response Body:**
```json
{
  "id": 2,
  "name": "John Employee",
  "email": "john@example.com",
  "role": "EMPLOYEE",
  "created_at": "2026-05-01 12:00:00"
}
```

#### **List All Customers**
- **Endpoint:** `GET /api/admin/customers`
- **Description:** Retrieves every customer in the system regardless of assignment.
- **Response Body:**
```json
[
  {
    "id": 10,
    "name": "Customer A",
    "email": "a@example.com",
    "phone": "1234567890",
    "assignedToName": "John Employee",
    "status": "PENDING"
  }
]
```

#### **List Employee's Customers**
- **Endpoint:** `GET /api/admin/employee/{id}/customers`
- **Description:** Lists all customers assigned to a specific employee.
- **Response Body:**
```json
[
  {
    "id": 10,
    "name": "Customer A",
    "email": "a@example.com",
    "phone": "1234567890",
    "assignedToName": "John Employee",
    "status": "PENDING"
  }
]
```

#### **List All Interactions**
- **Endpoint:** `GET /api/admin/interactions`
- **Description:** Retrieves a history of all interactions across all customers.
- **Response Body:**
```json
[
  {
    "id": 5,
    "notes": "Discussed pricing plans.",
    "interactionDate": "2026-05-02T14:30:00",
    "status": "INTERESTED",
    "nextFollowUpDate": "2026-05-10",
    "customer": {
      "id": 10,
      "name": "Customer A"
    },
    "employee": {
      "id": 2,
      "name": "John Employee"
    }
  }
]
```

#### **Analytics: Total Leads Count**
- **Endpoint:** `GET /api/admin/leads/count`
- **Description:** Returns the total number of leads in the system.
- **Response:** `150`

#### **Analytics: Closed Leads Count**
- **Endpoint:** `GET /api/admin/leads/closed`
- **Description:** Returns the number of leads that have reached the `CLOSED` status.
- **Response:** `45`

#### **Analytics: Conversion Rate**
- **Endpoint:** `GET /api/admin/analytics/conversion-rate`
- **Description:** Calculates the percentage of total leads that have been closed.
- **Response:** `30.0`

#### **Analytics: Best Performing Employee**
- **Endpoint:** `GET /api/admin/analytics/best-employee`
- **Description:** Returns the name of the employee who has closed the most leads.
- **Response:** `"John Employee"`

---

### 3. Customer Management APIs (`/api/customers`)
*Accessible by `ADMIN` and `EMPLOYEE` roles. Employees can only see/manage their own assigned customers.*

#### **Add Customer**
- **Endpoint:** `POST /api/customers`
- **Description:** Creates a new customer record.
- **Request Body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "555-0199",
  "assignedToUserId": 2
}
```
- **Response Body:**
```json
{
  "id": 11,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "555-0199",
  "assignedToName": "John Employee",
  "status": "PENDING"
}
```

#### **My Customers**
- **Endpoint:** `GET /api/customers/my`
- **Description:** Lists all customers assigned to the currently logged-in user.
- **Response Body:**
```json
[
  {
    "id": 11,
    "name": "Alice Smith",
    "status": "PENDING"
  }
]
```

#### **Filter Customers by Status**
- **Endpoints:** 
  - `GET /api/customers/interested`
  - `GET /api/customers/not-interested`
  - `GET /api/customers/closed`
  - `GET /api/customers/pending`
- **Description:** Retrieves customers assigned to the user, filtered by the specified status.
- **Response Body:** List of `CustomerResponseDto`.

#### **Get Customer by ID**
- **Endpoint:** `GET /api/customers/{id}`
- **Description:** Retrieves detailed information for a specific customer.
- **Response Body:**
```json
{
  "id": 11,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "555-0199",
  "assignedToName": "John Employee",
  "status": "PENDING"
}
```

#### **Update Customer**
- **Endpoint:** `PUT /api/customers/{id}`
- **Description:** Updates the basic details of an existing customer.
- **Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice.j@example.com",
  "phone": "555-0200"
}
```
- **Response Body:** Updated `CustomerResponseDto`.

---

### 4. Interaction APIs (`/api/interaction`)

#### **Create Interaction**
- **Endpoint:** `POST /api/interaction`
- **Description:** Records a new interaction event for a customer.
- **Request Body:**
```json
{
  "customerId": 11,
  "notes": "Called to discuss the new proposal.",
  "status": "CONTACTED",
  "nextFollowUpDate": "2026-05-05"
}
```
- **Response Body:**
```text
Interaction created successfully...!
```

#### **Get Customer Interactions**
- **Endpoint:** `GET /api/interaction/customer/{id}`
- **Description:** Retrieves the full interaction history for a specific customer.
- **Response Body:**
```json
[
  {
    "id": 6,
    "notes": "Initial contact made.",
    "interactionDate": "2026-05-02T09:00:00",
    "status": "NEW",
    "nextFollowUpDate": "2026-05-03",
    "customer": { "id": 11, "name": "Alice Smith" },
    "employee": { "id": 2, "name": "John Employee" }
  }
]
```

---

### 5. Lead Status APIs (`/api/leads`)

#### **Update Lead Status**
- **Endpoint:** `PUT /api/leads/{customerId}/status`
- **Description:** Manually updates the status of a lead.
- **Request Body:**
```json
{
  "status": "INTERESTED"
}
```
- **Response Body:**
```text
Lead status updated successfully
```

---

### 6. Dashboard APIs (`/api/dashboard`)

#### **Get Customer Count**
- **Endpoint:** `GET /api/dashboard/customers/count`
- **Description:** Returns the total count of customers. Admins can filter by employee using the query parameter.
- **Query Parameter:** `employeeId` (Optional)
- **Response:** `25`

---

## Error Handling
The system uses a `@RestControllerAdvice` to ensure all errors return a consistent JSON structure:
```json
{
    "timestamp": "2026-04-17T15:35:42.123",
    "message": "Error message details here",
    "status": 400
}
```

## How to Run
1. Create a MySQL database named `crmSelf_db`.
2. Update `src/main/resources/application.properties` with your MySQL username and password.
3. Run the application using Maven: `./mvnw spring-boot:run`
