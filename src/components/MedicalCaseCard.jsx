import {useNavigate} from "react-router-dom"

function MedicalCaseCard({medicalCase}){
  const navigate = useNavigate()
    return (
        <div className="border rounded-lg p-4 shadow mb-4">
          <h2 className="text-xl font-semibold">
            {medicalCase.diagnosis}
          </h2>

          <p>
            Verdict: {medicalCase.verdict}
          </p>
          <button onClick={()=>
            navigate(`/medical-case/${medicalCase._id}`)
          }>
            View Details
          </button>
        </div>
    )
}

export default MedicalCaseCard