import {BrowserRouter,Routes,Route} from "react-router-dom"
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import MedicalCaseDetails from "./pages/medicalCaseDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
        <Route path="/medical-case/:caseId" element={<MedicalCaseDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App