import { useNavigate } from "react-router-dom"
import {useState,useEffect} from "react"
import api from "../api/axios"
import MedicalCaseCard from "../components/MedicalCaseCard";

function Dashboard(){
    const navigate = useNavigate();
    const [medicalCases,setMedicalCases] = useState([])

    useEffect(()=>{
        fetchMedicalCases()
    },[])

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/")
    }

    const fetchMedicalCases = async ()=>{
        try{
          const token = localStorage.getItem("token")

          const response = await api.get(
            "/medical-case/my-cases",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                
                }
            }
          )
          setMedicalCases(response.data.medicalCases)
        }catch(error){
            console.error(error)
        }
    }

    return (
        <>
          <h1>Dashboard Page</h1>

          {medicalCases.map((medicalCase) => (
            <MedicalCaseCard 
              key={medicalCase._id}  
              medicalCase={medicalCase}
            />
          ))}

          <button onClick = {handleLogout}>
            Logout
          </button>
        </>
    )
}
export default Dashboard