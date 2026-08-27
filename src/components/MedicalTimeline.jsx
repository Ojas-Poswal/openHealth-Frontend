import MedicalCaseCard from "./MedicalCaseCard"

function MedicalTimeline({medicalCases}){
    const sortedCases = [...medicalCases].sort(
        (a,b) => 
            new Date(b.createdAt) - new Date(b.createdAt)
    )

    return (
        <div className="relative pl-8">
            {/* Timeline line */}
            <div className = "absolute left-4 top-0 bottom-0 w-1 bg-cyan-500" />

            <div className="space-y-8">
                {sortedCases.map((medicalCase) => (
                    <div
                      key={medicalCase._id}
                      className = "relative"
                    >
                        {/*timeline dot */}

                        <div className = "absolute -left-6 top-8 h-4 w-4 rounded-full big-cyan-500"/>
                         
                          <p className="text-cyan-400 text-sm mb-2">
                            {new Date(
                                medicalCase.createdAt).toLocaleDateString("en-US",
                                {
                                    month:"long",
                                    year:"numeric"
                                }
                            )}
                          </p>

                         <MedicalCaseCard 
                           medicalCase = {medicalCase}
                         />

                    </div>      
                ))}

            </div> 

        </div>
    )
}

export default MedicalTimeline