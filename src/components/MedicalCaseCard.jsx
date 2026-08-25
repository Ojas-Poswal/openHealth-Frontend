import {useNavigate} from "react-router-dom"

function MedicalCaseCard({medicalCase}){
  const navigate = useNavigate()
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-cyan-500 transition">
          <h2 className="text-2xl font-bold">
            {medicalCase.diagnosis}
          </h2>

          <p className="text-zinc-400 mt-2">
            Verdict: {medicalCase.verdict}
          </p>
          <button  className="mt-4 bg-cyan-500 px-4 py-2 rounded-lg text-black font-semibold" onClick={()=>
            navigate(`/medical-case/${medicalCase._id}`)
          }>
            View Details
          </button>
        </div>
    )
}

export default MedicalCaseCard