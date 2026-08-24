## Bug

Error:

Tailwind content was not centered despite using flex, items-center, and justify-center.

Cause:

Custom styles were still applied to `#root`:

    #root {
      width: 1126px;
      max-width: 100%;
      margin: 0 auto;
      text-align: center;
      border-inline: 1px solid var(--border);
      min-height: 100svh;
      display: flex;
      flex-direction: column;
    }

Additionally, the Tailwind utility class was written incorrectly:

    justify center

instead of:

    justify-center

Fix:

- Removed all custom `#root` styles.
- Kept only:

      @import "tailwindcss";

- Corrected the Tailwind utility class to:

      justify-center

Lesson:

When debugging Tailwind layouts:

- Check for existing CSS affecting layout.
- Verify Tailwind utility class names exactly match the documentation.
- Inspect the applied classes in browser DevTools when styles do not behave as expected.

## Bug
Error:
Tailwind content was not centered despite using flex, items-center, and justify-center.

Cause:
Vite's default CSS was still applying styles to #root.

Fix:
Removed default Vite CSS and kept only:

@import "tailwindcss";

Lesson:
Default starter CSS can override layout behavior. Remove boilerplate styles before building custom UI.

## Bug

Error:
Content was not horizontally centered.

Cause:
Tailwind utility class was written as:

justify center

instead of:

justify-center

Fix:
Corrected the Tailwind class name.

Lesson:
Tailwind utility classes must match exactly. A missing hyphen causes the utility to be ignored.

## Bug

Error:

Application rendered a blank page even though the URL changed correctly.

Cause:

The React Router container component was written as:

<Router>

instead of:

<Routes>

Fix:

Replaced:

<Router>

with:

<Routes>

and closed it using:

</Routes>

Lesson:

In React Router, Route components must be wrapped inside Routes. Using an undefined Router component prevents routes from rendering.

## React State Management

Concept:

useState()

Purpose:

Stores and updates component data without reloading the page.

Example:

const [email, setEmail] = useState("");

Flow:

Input
↓
State Update
↓
Component Re-render
↓
Updated UI

Outcome:

Login form inputs are now controlled by React state and can be accessed during form submission.

## Bug

Error:

Login request failed with:

Access to XMLHttpRequest has been blocked by CORS policy

Cause:

Frontend was running on:

http://localhost:5173

while backend was running on:

http://localhost:8000

The backend did not allow requests from a different origin.

Fix:

Installed CORS middleware and enabled it in Express.

import cors from "cors";

app.use(cors());

Lesson:

When frontend and backend run on different origins, CORS must be configured to allow browser communication.

## Bug

Error:

The requested module 'react-router-dom' does not provide an export named 'navigate'.

Cause:

Attempted to import:

import { navigate } from "react-router-dom";

instead of the Navigate component.

Fix:

Replaced with:

import { Navigate } from "react-router-dom";

Lesson:

Navigate is a React Router component used for redirection. The navigate function is obtained through the useNavigate() hook.

## Bug

Observation:

Medical cases were fetched twice and appeared twice in the browser console.

Cause:

React StrictMode was enabled in development mode.

<React.StrictMode>
    <App />
</React.StrictMode>

React intentionally invokes effects multiple times in development to detect side effects.

Impact:

Duplicate API requests and console logs appeared during development.

Lesson:

Repeated useEffect execution in development is expected when React StrictMode is enabled and does not occur in production builds.

## Bug

Error:

Medical case data was successfully fetched from the backend but did not appear on the screen.

Cause:

The API response was only logged using:

console.log(response.data);

The retrieved medical case was never stored in React state.

Fix:

Stored the response in state using:

setMedicalCase(
    response.data.medicalCase
);

Lesson:

Fetching data alone does not update the UI. React components re-render only when state changes.