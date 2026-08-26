import { useState } from "react"
import {useNavigate} from "react-router-dom"

function MedicalCaseCard({medicalCase}){
  
  const [isOpen,setIsOpen] = useState(false)
    return (
        <div 
        onClick={()=> setIsOpen(!isOpen)}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-cyan-500 transition cursor-pointer">
          <h2 className="text-2xl font-bold">
            {medicalCase.diagnosis}
          </h2>

          <p className="text-zinc-400 mt-2">
            Verdict: {medicalCase.verdict}
          </p>
          {isOpen && (
            <div className ="mt-4 border-t border-zinc-800 pt-4 space-y-2">
             <p>
               <span className="font-semibold">Status:</span>{" "}
               {medicalCase.status}
             </p>
               
             <p>
                <span className="font-semibold">Final Advice:</span>{" "}
               {medicalCase.finalAdvice}
             </p>

             <p>
               <span className="font-semibold">Diagnosis Date:</span>{" "}
               {new Date(medicalCase.diagnosedAt).toLocaleDateString()}
             </p>
            </div>
          )}
        </div>
    )
}

export default MedicalCaseCard