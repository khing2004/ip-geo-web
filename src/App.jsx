import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {

  //iintializing state
  const [token, setToken] = useState(localStorage.getItem("token"));
  
  //function that has to be passed to login page
  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
