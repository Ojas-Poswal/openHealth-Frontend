import {useState} from "react"

function Login() {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("")
    const handleSubmit = (e) => {
         e.preventDefault();

         console.log(email);
         console.log(password);
    };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md border rounded-xl p-8 shadow"
        >
        <h1 className="text-3xl font-bold mb-6">
          OpenHealth Patient
        </h1>

        <div className="mb-4">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>

        <div className="mb-6">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>

         <button
           type="submit"
           className="w-full bg-black text-white py-2 rounded"
         >
          Login
         </button>
      </form>
    </div>
  );
  
  
}

export default Login;