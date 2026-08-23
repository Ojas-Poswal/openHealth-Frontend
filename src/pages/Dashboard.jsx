import { useNavigate } from "react-router-dom"
import {useState,useEffect} from "react"
import api from "../api/axios"
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
          console.log(response.data)
        }catch(error){
            console.error(error)
        }
    }

    return (
        <>
          <h1>Dashboard Page</h1>

          <button onClick = {handleLogout}>
            Logout
          </button>
        </>
    )
}
export default Dashboard