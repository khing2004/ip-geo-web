// pages/Login.jsx
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      //console.log(res.data);

      const receivedToken = res.data.token;
      localStorage.setItem("token", receivedToken);      
      navigate("/home");
      onLoginSuccess(receivedToken);
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">IP Tracker</h1>
        <p className="text-gray-500 mt-2">Sign in to access Geolocation tools</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Email Address</label>
          <input 
            type="email"
            required
            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="admin@email.com"
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Password</label>
          <input 
            type="password"
            required
            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="••••••••"
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 font-bold transition-colors disabled:bg-blue-300"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  </div>
);
}

export default Login