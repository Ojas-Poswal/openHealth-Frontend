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

## Medical Case Details Rendering

Page:

MedicalCaseDetails.jsx

Purpose:

Display detailed information about a selected medical case.

React Concepts:

- Conditional Rendering
- State Rendering
- Date Formatting

Implementation:

if (!medicalCase) {
    return <h1>Loading...</h1>;
}

return (
    <div>
        <h1>Medical Case Details</h1>

        <h2>{medicalCase.diagnosis}</h2>

        <p>
            <strong>Verdict:</strong>
            {medicalCase.verdict}
        </p>

        <p>
            <strong>Status:</strong>
            {medicalCase.status}
        </p>

        <p>
            <strong>Final Advice:</strong>
            {medicalCase.finalAdvice}
        </p>
    </div>
);

Code Explanation:

medicalCase

→ Contains the medical case retrieved from the backend.

Conditional Rendering

→ Prevents rendering before data is available.

Loading State

→ Displays temporary content while waiting for the API response.

State Rendering

→ React automatically updates the UI when medicalCase state changes.

Flow:

Open Details Page
↓
Fetch Medical Case
↓
Store In State
↓
Re-render Component
↓
Display Medical Case Information

Outcome:

Patients can view detailed information about a selected medical case.

## Date Formatting

Purpose:

Convert backend timestamps into a human-readable format.

Implementation:

new Date(
    medicalCase.createdAt
).toLocaleDateString()

new Date(
    medicalCase.diagnosedAt
).toLocaleDateString()

Code Explanation:

new Date(...)

→ Converts the ISO timestamp returned by MongoDB into a JavaScript Date object.

toLocaleDateString()

→ Formats the date according to the user's locale.

Example:

Backend:

2026-08-16T14:36:17.649Z

Displayed:

16/08/2026

Outcome:

Medical case dates are displayed in a readable format for patients.

## Dashboard Layout

Components:

- Dashboard.jsx
- Sidebar.jsx
- MedicalCaseCard.jsx

Purpose:

Create a structured dashboard interface for authenticated patients.

Layout:

Sidebar

↓

Dashboard Header

↓

Search Bar

↓

Statistics Cards

↓

Medical Cases List

Outcome:

Dashboard now provides a dedicated interface for viewing medical cases and patient information.

---

## Statistics Cards

Purpose:

Provide quick insights into patient medical data.

Metrics:

- Total Cases
- Active Cases
- Reports

Implementation:

{medicalCases.length}

{medicalCases.filter(
    c => c.status === "active"
).length}

Code Explanation:

medicalCases.length

→ Returns the total number of medical cases.

filter()

→ Creates a new array containing only active medical cases.

length

→ Counts the filtered results.

Flow:

Medical Cases Retrieved

↓

Calculate Statistics

↓

Render Statistics Cards

↓

Display Dashboard Summary

Outcome:

Patients can instantly view important information about their medical cases.

---

## Dashboard Medical Case Rendering

Purpose:

Render all patient medical cases dynamically using reusable components.

Implementation:

{medicalCases.map((medicalCase) => (
    <MedicalCaseCard
        key={medicalCase._id}
        medicalCase={medicalCase}
    />
))}

Code Explanation:

map()

→ Iterates through the medicalCases array.

MedicalCaseCard

→ Displays information for a single medical case.

key

→ Unique identifier used by React to efficiently update lists.

Flow:

Medical Cases Array

↓

map()

↓

MedicalCaseCard Components

↓

Rendered Dashboard

Outcome:

All patient medical cases are displayed dynamically on the dashboard.

---

# Dashboard Search Functionality

## Overview

Implemented a client-side search feature on the Dashboard page that allows patients to quickly filter and locate medical cases based on their diagnosis.

---

## Features

- Real-time search filtering
- Case-insensitive matching
- Instant UI updates using React state
- No additional API requests required

---

## Implementation

### Search State

```javascript
const [searchTerm, setSearchTerm] = useState("");
```

Stores the text entered by the user in the search bar.

---

### Filter Logic

```javascript
const filteredCases = medicalCases.filter((medicalCase) =>
  medicalCase.diagnosis
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
```

Filters all medical cases and returns only those whose diagnosis matches the entered search term.

---

### Search Input

```jsx
<input
  type="text"
  placeholder="Search Cases..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

Updates the search state whenever the user types.

---

### Rendering Filtered Results

```jsx
{
  filteredCases.map((medicalCase) => (
    <MedicalCaseCard
      key={medicalCase._id}
      medicalCase={medicalCase}
    />
  ));
}
```

Displays only the cases matching the search query.

---

## Flow

Dashboard Loads

↓

Medical Cases Fetched

↓

Stored In State

↓

User Types In Search Bar

↓

searchTerm Updates

↓

filteredCases Recalculates

↓

Component Re-renders

↓

Matching Cases Displayed

---

## Outcome

Patients can quickly search and locate specific medical cases without reloading the page or making additional backend requests.

# Dashboard Improvements

## Features Added

- Fixed sidebar positioning
- Sidebar remains visible while scrolling
- Dashboard content scrolls independently
- Implemented medical case search
- Added empty search state
- Added dashboard statistics cards

## Search Functionality

Purpose:
Allow users to quickly find medical cases.

Implementation:
- Added search input field
- Search updates in real time
- Cases filtered by diagnosis

Code Flow:

User Types
↓
searchTerm State Updates
↓
filteredCases Recalculates
↓
Component Re-renders
↓
Matching Cases Displayed

Outcome:
Users can instantly search through their medical cases.

# Expandable Medical Case Cards

## Purpose

Allow patients to view detailed medical information without leaving the dashboard.

---

## Implementation

Added local state inside the MedicalCaseCard component:

```javascript
const [isOpen, setIsOpen] = useState(false);

# Expandable Medical Timeline

## Purpose

Transform the medical case list into a timeline-style patient journey.

Instead of navigating to a separate details page, users can expand and collapse medical cases directly from the dashboard.

---

## Features Added

- Expandable medical case cards
- Timeline visualization
- Scrollable medical history section
- Search compatibility maintained
- Card click toggles details
- Removed "View Details" button

---

## State Management

Added local state inside MedicalCaseCard:

```javascript
const [isOpen, setIsOpen] = useState(false);
```

Purpose:

- Controls whether a card is expanded
- Stores UI state locally
- Prevents unnecessary dashboard re-renders

---

## Toggle Functionality

```javascript
onClick={() => setIsOpen(!isOpen)}
```

Purpose:

- Opens card on first click
- Closes card on second click

---

## Conditional Rendering

```jsx
{isOpen && (
  <div>
    ...
  </div>
)}
```

Purpose:

- Displays additional medical information only when expanded
- Keeps dashboard clean and compact

---

## Timeline Structure

```jsx
<div className="border-l-2 border-cyan-500 pl-6">
```

Purpose:

- Creates the vertical timeline line
- Connects medical events visually

---

## Flow

Dashboard Loads

↓

Medical Cases Fetched

↓

Timeline Rendered

↓

User Clicks Card

↓

isOpen State Updates

↓

Component Re-renders

↓

Medical Details Displayed

---

## Outcome

Patients can explore their medical history through an interactive timeline without leaving the dashboard.