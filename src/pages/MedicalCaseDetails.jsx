import {useState,useEffect} from "react"
import {useParams} from "react-router-dom"
import api from "../api/axios"

function MedicalCaseDetails(){
   const {caseId} = useParams();
   const [medicalCase,setMedicalCase]=useState(null)
   const fetchMedicalCase = async () => {
      try{
          const token = localStorage.getItem("token")
          
          const response = await api.get(
              `/medical-case/${caseId}`,
              {
                  headers : {
                      Authorization: `Bearer ${token}`
                  }
              }
          )
          console.log(response.data.medicalCase)
          setMedicalCase(response.data.medicalCase)

    }catch(error){
        console.error(error)
    }
}
   useEffect(()=>{
            fetchMedicalCase()
    },[])
   if(!medicalCase){
    return <h1>Loading...</h1>
   }
   return (
     <div>
        <h1>Medical Case Details</h1>
        <h2>{medicalCase.diagnosis}</h2>
        <p>
            <strong>Verdict:</strong> {medicalCase.verdict}
        </p>
        <p>
            <strong>Status:</strong> {medicalCase.status}
        </p>
        <p>
            <strong>Final Advice</strong> {medicalCase.finalAdvice}
        </p>
        <p>
            <strong>Diagnosed At:</strong>{" "}
            {new Date(medicalCase.diagnosedAt).toLocaleDateString()}
        </p>
        <p>
            <strong>Created At:</strong>{" "}
            {new Date(medicalCase.createdAt).toLocaleDateString()}
        </p>
       <p>{medicalCase.verdict}</p>
     </div>
   )
}

export default MedicalCaseDetails