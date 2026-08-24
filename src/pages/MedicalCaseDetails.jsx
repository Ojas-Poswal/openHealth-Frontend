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
     <>
       <h1>{medicalCase.diagnosis}</h1>
       <p>{medicalCase.verdict}</p>
     </>
   )
}

export default MedicalCaseDetails