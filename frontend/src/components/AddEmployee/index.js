import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./index.css"; // Ensure the correct import

function AddEmployee() {
  const [employee, setEmployee] = useState({
    f_Name: "",
    f_Email: "",
    f_Mobile: "",
    f_Designation: "",
    f_gender: "",
    f_Course: [],
    f_Image: null, // Updated key name
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "f_Course") {
      const { value, checked } = e.target;
      setEmployee({
        ...employee,
        f_Course: checked
          ? [...employee.f_Course, value]
          : employee.f_Course.filter((course) => course !== value),
      });
    } else if (e.target.name === "f_Image") {
      const file = e.target.files[0];
      if (file && !file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      setEmployee({ ...employee, f_Image: file }); // Corrected field name
    } else {
      setEmployee({ ...employee, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!/^\d{10}$/.test(employee.f_Mobile)) {
      alert("Please enter a valid mobile number.");
      return;
    }
  
    const formData = new FormData();
    Object.keys(employee).forEach((key) => {
      if (key === "f_Course") {
        employee[key].forEach((course) => formData.append(key, course));
      } else if (key === "f_Image" && employee.f_Image) {
        formData.append(key, employee[key]);
      } else {
        formData.append(key, employee[key]);
      }
    });
  
    setIsLoading(true);
  
    try {
      await axios.post("http://localhost:3000/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage("Employee added successfully!");
      setEmployee({
        f_Name: "",
        f_Email: "",
        f_Mobile: "",
        f_Designation: "",
        f_gender: "",
        f_Course: [],
        f_Image: null, // Reset image field
      });
  
      // After successful addition, navigate to employees list
      navigate("/employees"); // Directly navigate here after successful submission
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add employee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-employee-container">
      <h2>Add Employee</h2>
      <div className="add-employee-form">
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div>
            <label>Name</label>
            <input
              type="text"
              name="f_Name"
              placeholder="Name"
              value={employee.f_Name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label>Email</label>
            <input
              type="email"
              name="f_Email"
              placeholder="Email"
              value={employee.f_Email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mobile Field */}
          <div>
            <label>Mobile No</label>
            <input
              type="text"
              name="f_Mobile"
              placeholder="Mobile"
              value={employee.f_Mobile}
              onChange={handleChange}
              required
            />
          </div>

          {/* Designation */}
          <div>
            <label>Designation</label>
            <select
              name="f_Designation"
              value={employee.f_Designation}
              onChange={handleChange}
              required
            >
              <option value="">Select Designation</option>
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label>Gender</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="f_gender"
                  value="M"
                  onChange={handleChange}
                  checked={employee.f_gender === "M"}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="f_gender"
                  value="F"
                  onChange={handleChange}
                  checked={employee.f_gender === "F"}
                />
                Female
              </label>
            </div>
          </div>

          {/* Course */}
          <div>
            <label>Course</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="f_Course"
                  value="MCA"
                  onChange={handleChange}
                  checked={employee.f_Course.includes("MCA")}
                />
                MCA
              </label>
              <label>
                <input
                  type="checkbox"
                  name="f_Course"
                  value="BCA"
                  onChange={handleChange}
                  checked={employee.f_Course.includes("BCA")}
                />
                BCA
              </label>
              <label>
                <input
                  type="checkbox"
                  name="f_Course"
                  value="BSC"
                  onChange={handleChange}
                  checked={employee.f_Course.includes("BSC")}
                />
                BSC
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label>Image Upload</label>
            <input
              type="file"
              name="f_Image"
              onChange={handleChange}
            />
          </div>

          <div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
        {successMessage && <p>{successMessage}</p>}
      </div>
    </div>
  );
}

export default AddEmployee;
