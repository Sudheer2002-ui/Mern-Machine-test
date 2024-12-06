import React, { Component } from "react";
import axios from "axios";
import { Navigate, Link } from "react-router-dom";
import './index.css'; // Assuming the CSS is in EmployeeStyles.css

class Employees extends Component {
  state = {
    employees: [],
    searchQuery: "", // State for managing search query
    redirectToLogin: false, // To trigger redirection to login page
  };

  componentDidMount() {
    this.fetchEmployees();
  }

  fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Trigger redirect to login page if no token exists
      this.setState({ redirectToLogin: true });
      return;
    }

    try {
      const response = await axios.get("http://localhost:3000/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.setState({ employees: response.data });
    } catch (error) {
      alert("Failed to fetch employees");
    }
  };

  deleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.delete(`http://localhost:3000/employees/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.fetchEmployees(); // Refresh the list after deletion
    } catch (error) {
      alert("Failed to delete employee");
    }
  };

  handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    this.setState({ redirectToLogin: true }); // Trigger redirect to login page
  };

  // Handle search input change
  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  render() {
    const { employees, searchQuery, redirectToLogin } = this.state;

    if (redirectToLogin) {
      return <Navigate to="/login" />;
    }

    // Filter employees based on name
    const filteredEmployees = employees.filter((emp) => {
      return emp.f_Name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
      <div className="container">
        <div className="header">
          <h2>Employee List</h2>
          <button onClick={this.handleLogout}>Logout</button>
        </div>
        
        {/* Search Input */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={this.handleSearchChange}
          />
        </div>

        {/* Create Employee Link */}
        <Link to="/add-employee" className="create-employee-link">
          Create Employee
        </Link>

        <table className="employee-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Unique Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Designation</th>
              <th>Gender</th>
              <th>Course</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const imagePath = emp.f_Image.replace("\\", "/");
                const createDate = new Date(emp.f_CreateDate);
                const formattedDate = createDate.toLocaleDateString();

                return (
                  <tr key={emp.f_Id}>
                    <td>
                      <img
                        src={`http://localhost:3000/${imagePath}`}
                        alt="Employee"
                      />
                    </td>
                    <td>{emp.f_Id}</td>
                    <td>{emp.f_Name}</td>
                    <td>{emp.f_Email}</td>
                    <td>{emp.f_Mobile}</td>
                    <td>{emp.f_Designation}</td>
                    <td>{emp.f_gender}</td>
                    <td>{Array.isArray(emp.f_Course) ? emp.f_Course.join(", ") : emp.f_Course}</td>
                    <td>{formattedDate}</td>
                    <td>
                      <Link to={`/edit-employee/${emp.f_Id}`} className="edit-link">
                        Edit
                      </Link>
                      <button onClick={() => this.deleteEmployee(emp.f_Id)}>Delete</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="no-employees-message">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Employees;
