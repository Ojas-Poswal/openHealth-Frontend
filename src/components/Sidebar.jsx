import { useNavigate } from "react-router-dom"
function Sidebar(){
    const navigate = useNavigate()
    const handleLogout = () => {
     localStorage.removeItem("token")
     navigate("/")
}
    return (
        <div className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col">
         <h1 className="text-4xl font-bold mb-12">openHealth</h1>

         <div className="flex flex-col gap-6 text-lg">
          <button className=" bg-cyan-500/20 text-cyan-400 rounded-xl px-4 py-3">Dashboard</button>
          <button className="hover:bg-zinc-900 rounded-x1 px-4 py-3 transition">Cases</button>
          <button className="hover:bg-zinc-900 rounded-x1 px-4 py-3 transition">Reports</button>
          <button className="hover:bg-zinc-900 rounded-x1 px-4 py-3 transition">Profile</button>
         </div>
          <button className="mt-auto text-red-500"
          onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default Sidebar