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
## React Side Effects (useEffect)

Concept:

useEffect()

Purpose:

Runs code after a component renders.

Implementation:

useEffect(() => {
    fetchMedicalCases();
}, []);

Explanation:

The empty dependency array:

[]

tells React to execute the effect only when the component first loads.

Flow:

Dashboard Loads
↓
useEffect Executes
↓
fetchMedicalCases()
↓
API Request Sent

Outcome:

Medical cases are automatically fetched when the dashboard opens without requiring user interaction.

## Dashboard Medical Case Retrieval

Endpoint:

GET /api/v1/medical-case/my-cases

Authentication:

Bearer JWT

Purpose:

Retrieve all medical cases belonging to the currently authenticated patient.

Implementation:

const token = localStorage.getItem("token");

const response = await api.get(
    "/medical-case/my-cases",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

Code Explanation:

localStorage.getItem("token")
→ Retrieves the JWT stored after login.

Authorization Header
→ Sends the JWT to the backend for authentication.

api.get(...)
→ Sends a GET request to fetch the patient's medical cases.

response.data
→ Contains the backend response including the medical cases array.

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

## React State Update From API Response

Concept:

useState()

Purpose:

Store backend data inside the component and trigger UI updates.

Implementation:

setMedicalCases(
    response.data.medicalCases
);

Code Explanation:

response.data.medicalCases
→ Extracts the medical cases array from the backend response.

setMedicalCases(...)
→ Updates React state.

React automatically re-renders the component after the state changes.

Flow:

API Response Received
↓
Extract Medical Cases
↓
Update State
↓
Component Re-renders

Outcome:

Medical case data is now available inside the dashboard component and ready for display.

## Medical Case Card Component

Component:

MedicalCaseCard.jsx

Purpose:

Displays information about a single medical case.

Props:

medicalCase

Implementation:

function MedicalCaseCard({ medicalCase }) {
    return (
        <div>
            <h2>{medicalCase.diagnosis}</h2>
            <p>{medicalCase.verdict}</p>
        </div>
    );
}

Code Explanation:

Props
→ Allow data to be passed from a parent component to a child component.

medicalCase
→ Represents one medical case object from the medicalCases array.

medicalCase.diagnosis
→ Displays the diagnosis field.

medicalCase.verdict
→ Displays the verdict field.

Flow:

Dashboard
↓
medicalCases Array
↓
map()
↓
MedicalCaseCard
↓
Display Case Information

Outcome:

Medical case information is now displayed through a reusable React component.

## Dynamic List Rendering

Concept:

Array.map()

Purpose:

Render multiple UI elements from an array of data.

Implementation:

{medicalCases.map((medicalCase) => (
    <MedicalCaseCard
        key={medicalCase._id}
        medicalCase={medicalCase}
    />
))}

Code Explanation:

medicalCases
→ Array containing all patient medical cases.

map()
→ Iterates through each medical case.

key
→ Unique identifier used by React to efficiently update lists.

medicalCase Prop
→ Passes the current medical case to the component.

Flow:

Medical Cases Array
↓
map()
↓
Create Component For Each Case
↓
Render UI

Outcome:

All patient medical cases are rendered dynamically from backend data.

## Medical Case Details Retrieval

Page:

MedicalCaseDetails.jsx

Route:

/medical-case/:caseId

Authentication:

Bearer JWT

Purpose:

Retrieve and display detailed information for a specific medical case.

React Concepts:

- useParams()
- useState()
- useEffect()

Implementation:

const { caseId } = useParams();

const response = await api.get(
    `/medical-case/${caseId}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

setMedicalCase(
    response.data.medicalCase
);

Code Explanation:

useParams()

→ Extracts the caseId from the URL.

caseId

→ Identifies which medical case should be retrieved.

api.get(...)

→ Sends an authenticated request to the backend.

response.data.medicalCase

→ Contains the requested medical case object.

setMedicalCase(...)

→ Stores the retrieved medical case in React state.

Flow:

Medical Case Card
↓
Select Case
↓
Navigate To Details Page
↓
Extract caseId
↓
Backend Request
↓
Medical Case Returned
↓
Store In State
↓
Render Details

Verification:

Successfully received:

{
    message: "Fetched medical case",
    medicalCase: {...}
}

Successfully displayed:

ACL Injury

Grade 2 ACL Sprain

Outcome:

Patients can retrieve and view detailed information for an individual medical case.