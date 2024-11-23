import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./index.css"
function Register() {
  const [f_userName, setUserName] = useState("");
  const [f_Pwd, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/register", { f_userName, f_Pwd });
      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="main-container">
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input 
          className="input-field"
          type="text"
          placeholder="Username"
          value={f_userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
        className="input-field"
          type="password"
          placeholder="Password"
          value={f_Pwd}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button className="register-button" type="submit">Register</button>
      </form>
    </div>
    </div>
  );
}

export default Register;
