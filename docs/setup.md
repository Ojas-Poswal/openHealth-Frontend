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