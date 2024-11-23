import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Retrieve JWT token from localStorage

  // If token exists, render the protected content (children)
  if (token) {
    return children;
  }

  // If token does not exist, redirect to login page
  return <Navigate to="/login" />;
};

export default ProtectedRoute;
