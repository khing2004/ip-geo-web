import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { email, password });

      const receivedToken = res.data.token;
      
      if (receivedToken){
        localStorage.setItem("token", receivedToken);

        if (onLoginSucess){
          onLoginSucess(receivedToken);
        } //update parent (app.jsx) state immediately

        navigate("/home");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Invalid email or password.");
      } else {
        console.error("Login Error:", err);
        alert("You have entered the correct password. Please refresh the page if no redirection occurs.");
      }
    }
  };

  return (
    <div>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
