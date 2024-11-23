import React from "react";
import { BrowserRouter as Router, Routes, Route ,Navigate} from "react-router-dom";
import LoginForm from "./components/LoginForm/index.js";
import Register from "./components/Register/index.js";
import Employees from "./components/Employees/index.js";
import AddEmployee from "./components/AddEmployee/index.js";
import EditEmployee from "./components/EditEmployees/index.js";
import ProtectedRoute from "./components/ProtecedRoute/index.js";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root route to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-employee"
          element={
            <ProtectedRoute>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-employee/:id"
          element={
            <ProtectedRoute>
              <EditEmployee />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
