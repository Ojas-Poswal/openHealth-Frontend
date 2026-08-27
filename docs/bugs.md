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

## Bug

Error:

Medical case cards appeared outside the dashboard layout and alignment was broken.

Cause:

JSX div nesting was incorrect.

The medical cases container was rendered outside the main dashboard content container.

Fix:

Moved the medical cases section inside:

<div className="flex-1 p-6">

and corrected the closing div hierarchy.

Lesson:

React layouts depend heavily on correct JSX nesting. A misplaced closing tag can break the entire page structure.

---

## Bug

Observation:

Statistics cards appeared attached directly to the search bar.

Cause:

No spacing existed between the search input and the statistics section.

Fix:

Added:

mb-6

to the search bar.

Lesson:

Spacing utilities help create proper visual hierarchy and improve readability.

---

# Bug Report: Medical Cases Disappeared After Search Implementation

## Error

Medical case cards disappeared after implementing dashboard search functionality.

---

## Cause

The UI was rendering the filtered array:

```javascript
filteredCases
```

instead of the original:

```javascript
medicalCases
```

When the search query did not match any diagnosis values, the filtered array became empty, causing no cards to render.

---

## Investigation

Used browser console logs to inspect:

```javascript
console.log(medicalCases);
console.log(filteredCases);
```

Verified that:

- API data was being fetched successfully.
- Medical cases were stored correctly in state.
- Search filtering logic was executing properly.

---

## Fix

Implemented diagnosis-based filtering:

```javascript
const filteredCases = medicalCases.filter((medicalCase) =>
  medicalCase.diagnosis
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
```

Rendered:

```jsx
filteredCases.map(...)
```

instead of:

```jsx
medicalCases.map(...)
```

---

## Lesson Learned

When implementing search functionality:

- Always verify the field being filtered.
- Inspect API responses using console logs.
- Confirm that the rendered array contains expected values.
- Remember that React only displays what is returned from the current render state.


### Bug

```md
## Bug

Error:

TypeError: toLocalDateString is not a function

Cause:

Incorrect JavaScript Date method name was used.

Incorrect:

new Date(date).toLocalDateString()

Correct:

new Date(date).toLocaleDateString()

Fix:

Replaced the invalid method with:

new Date(date).toLocaleDateString()

Lesson:

JavaScript methods are case-sensitive and must exactly match the official API name.

# Bug Report

## Bug

Error:

TypeError: toLocalDateString is not a function

---

## Cause

Incorrect JavaScript Date method name was used.

Incorrect:

```javascript
new Date(date).toLocalDateString()
```

Correct:

```javascript
new Date(date).toLocaleDateString()
```

---

## Fix

Replaced the invalid method with:

```javascript
new Date(date).toLocaleDateString()
```

---

## Lesson Learned

JavaScript methods are case-sensitive.

Always verify method names against official documentation.

---

# Bug Report

## Error

Medical timeline page rendered a blank screen.

---

## Cause

Timeline component referenced a variable that was never defined:

```javascript
sortedCases
```

React threw:

```javascript
ReferenceError: sortedCases is not defined
```

---

## Fix

Created the variable before rendering:

```javascript
const sortedCases = [...medicalCases];
```

or

```javascript
const sortedCases = filteredCases;
```

depending on implementation.

---

## Lesson Learned

Any variable used inside JSX must exist before rendering.

Undefined variables immediately break component rendering.

---

# Bug Report

## Error

Medical case cards disappeared after search implementation.

---

## Cause

Search filtering returned an empty array when no diagnosis matched the entered text.

The UI rendered:

```javascript
filteredCases
```

instead of:

```javascript
medicalCases
```

which caused all cards to disappear.

---

## Investigation

Verified:

```javascript
console.log(medicalCases);
console.log(filteredCases);
```

Confirmed:

- API calls succeeded
- State updated correctly
- Filtering logic executed correctly

---

## Fix

Implemented diagnosis-based filtering:

```javascript
const filteredCases = medicalCases.filter(
  (medicalCase) =>
    medicalCase.diagnosis
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
);
```

Added empty-state rendering:

```jsx
{filteredCases.length === 0 ? (
  <p>No cases found.</p>
) : (
  filteredCases.map(...)
)}
```

---

## Lesson Learned

Always handle empty arrays when implementing search functionality.

Users should receive feedback instead of a blank interface.