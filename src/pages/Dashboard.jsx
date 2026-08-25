import { useState, useEffect } from "react";
import api from "../api/axios";

import MedicalCaseCard from "../components/MedicalCaseCard";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [medicalCases, setMedicalCases] = useState([]);
  const [searchTerm,setSearchTerm] = useState("")

  useEffect(() => {
    fetchMedicalCases();
  }, []);

  const fetchMedicalCases = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/medical-case/my-cases",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMedicalCases(response.data.medicalCases);
    } catch (error) {
      console.error(error);
    }
  };
  

  const filteredCases = medicalCases.filter((medicalCase)=>
    medicalCase.diagnosis
               .toLowerCase()
               .includes(searchTerm.toLowerCase())
  )
  return (
    <div className="min-h-screen bg-black text-white flex">
      
      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-5xl font-bold mb-8">
          Welcome Back
        </h1>

        <input
          type="text"
          placeholder="Search Cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-6"
        />

        <div className="grid grid-cols-3 gap-4 mb-10">

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h3 className="text-zinc-400">Total Cases</h3>
            <p className="text-3xl font-bold">
              {medicalCases.length}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h3 className="text-zinc-400">Active Cases</h3>
            <p className="text-3xl font-bold">
              {medicalCases.filter(c => c.status === "active").length}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h3 className="text-zinc-400">Reports</h3>
            <p className="text-3xl font-bold">
              0
            </p>
          </div>

        </div>

       <div className="space-y-6">
           {filteredCases.length === 0 ? (
               <p className="text-zinc-400 text-center"> No cases found.</p>
               ) : (
               filteredCases.map((medicalCase) => (
                 <MedicalCaseCard
                     key={medicalCase._id}
                     medicalCase={medicalCase}
                  />
              ))
            )}
          </div>

      </div>

    </div>
  );
}

export default Dashboard;