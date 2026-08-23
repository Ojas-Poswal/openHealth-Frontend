function MedicalCaseCard({medicalCase}){
    return (
        <div className="border rounded-lg p-4 shadow mb-4">
          <h2 className="text-xl font-semibold">
            {medicalCase.diagnosis}
          </h2>

          <p>
            Verdict: {medicalCase.verdict}
          </p>
        </div>
    )
}

export default MedicalCaseCard