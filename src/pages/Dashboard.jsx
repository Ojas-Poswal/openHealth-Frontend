import { useNavigate } from "react-router-dom"
function Dashboard(){
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/")
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