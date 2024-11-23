import React, { Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import "./index.css"

class Login extends Component {
  state = {
    f_userName: "",
    f_Pwd: "",
    errorMsg: "",
    redirectToEmployees: false,
    redirectToRegister: false, // State to manage the redirect to register
  };

  handleLogin = async (e) => {
    e.preventDefault();
    const { f_userName, f_Pwd } = this.state;

    try {
      const response = await axios.post("http://localhost:3000/login", {
        f_userName,
        f_Pwd,
      });
      localStorage.setItem("token", response.data.token);
      this.setState({ redirectToEmployees: true });
    } catch (error) {
      this.setState({ errorMsg: error.response?.data?.message || "Login failed" });
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  redirectToRegister = () => {
    this.setState({ redirectToRegister: true }); // Set the flag to true
  };

  render() {
    const { f_userName, f_Pwd, errorMsg, redirectToEmployees, redirectToRegister } = this.state;

    // If a token exists in localStorage, navigate to /employees
    const token = localStorage.getItem("token");
    if (token || redirectToEmployees) {
      return <Navigate to="/employees" />;
    }

    // If redirectToRegister flag is true, navigate to /register
    if (redirectToRegister) {
      return <Navigate to="/register" />;
    }

    return (
      <div className="main-container">      
        <div className="card">
        <h2>Login</h2>
        <form onSubmit={this.handleLogin}>
          <input
          className="input-field"
            type="text"
            name="f_userName"
            placeholder="Username"
            value={f_userName}
            onChange={this.handleChange}
            required
          />
          <br/>
          <input
          className="input-field"
            type="password"
            name="f_Pwd"
            placeholder="Password"
            value={f_Pwd}
            onChange={this.handleChange}
            required
          />
          <br/>
          <button type="submit" className="login-button">Login</button>
        </form>
        {errorMsg && <p style={{ color: "red" }}>**{errorMsg}</p>}
        <p>Don't have an account?</p>
        <button onClick={this.redirectToRegister} className="register-button">Register here</button>
      </div></div>

    );
  }
}

export default Login;
