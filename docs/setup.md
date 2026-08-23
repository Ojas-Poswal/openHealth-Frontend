## Frontend Project Initialization

Project:
OpenHealth Patient

Stack:

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS

Purpose:

Provides the patient-facing interface for OpenHealth.

Outcome:

Frontend project initialized and ready for routing, UI development, and backend integration.

## Tailwind CSS Configuration

Files Updated:

- vite.config.js
- src/index.css
- src/App.jsx

Verification:

Created a test component using Tailwind utility classes and confirmed styling was applied correctly.

Outcome:

Tailwind CSS successfully configured and ready for UI development.

## Frontend Folder Structure

Structure:

src
├── pages
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   └── MedicalCaseDetails.jsx
│
├── components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── MedicalCaseCard.jsx
│   └── ReportCard.jsx
│
├── services
│   └── api.js

Purpose:

- pages → Full application screens
- components → Reusable UI elements
- services → API communication layer

Benefits:

- Clear separation of concerns
- Scalable project structure
- Easier maintenance and feature development

Outcome:

Frontend architecture established and prepared for routing, authentication, dashboard development, and backend integration.

## React Fundamentals

Concepts Learned:

- Components
- JSX
- Props

Examples:

Component:

function Login() {
    return <h1>Login Page</h1>;
}

JSX:

const appName = "OpenHealth";

<h1>{appName}</h1>

Props:

<Login title="OpenHealth" />

Purpose:

Introduced the foundational concepts required to build React applications.

Outcome:

Successfully rendered the first React component and understood how data can be displayed and passed between components.

## React Router Setup

Pages Created:

- Login
- Register
- Dashboard
- MedicalCaseDetails

Routes:

- /
- /register
- /dashboard
- /medical-case/:caseId

Purpose:

Provides navigation between application screens without reloading the page.

Outcome:

Frontend routing successfully established and verified.

## React Form Handling

Concepts:

- form
- onSubmit
- preventDefault

Purpose:

Handle form submissions without refreshing the page.

Implementation:

const handleSubmit = (e) => {
    e.preventDefault();
}

Outcome:

Login form now follows standard React form handling practices and is ready for backend API integration.

## Axios Configuration

File Created:

- src/api/axios.js

Implementation:

import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api/v1"
});

export default api;

Purpose:

Centralizes backend API communication and avoids repeating the backend URL across the application.

Benefits:

- Cleaner API calls
- Easier environment configuration
- Single source of truth for backend endpoints

Outcome:

Frontend is configured to communicate with the OpenHealth backend.

## Patient Login API Integration

Endpoint:

POST /api/v1/patients/login

Request Body:

{
    "email": "patient@example.com",
    "password": "password123"
}

Flow:

Patient Credentials
↓
React State
↓
Axios POST Request
↓
Backend Authentication
↓
JWT Generation
↓
Success Response

Implementation:

const response = await api.post(
    "/patients/login",
    {
        email,
        password
    }
);

Verification:

Successfully received:

{
    "message": "Login Successful",
    "token": "..."
}

Outcome:

Patient frontend successfully communicates with the backend authentication system and receives a JWT token upon successful login.

## JWT Storage

Purpose:

Stores the authentication token on the client after successful login.

Implementation:

localStorage.setItem(
    "token",
    response.data.token
);

Benefits:

- Persists authentication across page refreshes
- Enables access to protected APIs
- Eliminates repeated logins during a session

Flow:

Login Success
↓
JWT Received
↓
localStorage
↓
Future Authenticated Requests

Outcome:

Patient JWT is securely stored in the browser and available for future authenticated API requests.

## Dashboard Navigation

Purpose:

Redirect authenticated patients to the dashboard immediately after login.

Implementation:

navigate("/dashboard");

Flow:

Login Success
↓
Store JWT
↓
Navigate Dashboard

Outcome:

Patients are automatically redirected to the dashboard after successful authentication, improving user experience.

## Protected Routes

Component:

ProtectedRoute.jsx

Purpose:

Restricts access to authenticated pages.

Implementation:

const token = localStorage.getItem("token");

if (!token) {
    return <Navigate to="/" />;
}

return children;

Flow:

User Requests Protected Page
↓
Check JWT
↓
Token Exists?
├─ Yes → Render Page
└─ No → Redirect Login

Protected Routes:

- /dashboard

Verification:

Removed JWT from localStorage and attempted to access:

/dashboard

Result:

Automatically redirected to:

/

Outcome:

Unauthenticated users cannot access protected pages while authenticated users retain access.

## Patient Logout

Purpose:

Ends the authenticated session.

Implementation:

localStorage.removeItem("token");

navigate("/");

Flow:

Logout
↓
Remove JWT
↓
Redirect Login

Outcome:

Patients can securely terminate their session and lose access to protected routes.

## Dashboard Medical Case Retrieval

Endpoint:

GET /api/v1/medical-case/my-cases

Authentication:

Bearer JWT

Implementation:

const response = await api.get(
    "/medical-case/my-cases",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

Flow:

Dashboard Load
↓
Retrieve JWT
↓
Send Authenticated Request
↓
Backend Verification
↓
Medical Cases Returned

Verification:

Successfully retrieved:

{
    message: "Medical cases fetched successfully",
    medicalCases: [...]
}

Outcome:

Dashboard successfully retrieves medical cases belonging to the authenticated patient.