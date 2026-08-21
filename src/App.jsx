import {BrowserRouter,Routes,Route} from "react-router-dom"
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import MedicalCaseDetails from "./pages/medicalCaseDetails";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medical-case/:caseId" element={<MedicalCaseDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App