import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./index.css"
function EditEmployee() {
  const { id } = useParams();
  const [employee, setEmployee] = useState({
    f_Name: "",
    f_Email: "",
    f_Mobile: "",
    f_Designation: "",
    f_gender: "",
    f_Course: [],
    f_Image: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/employees/${id}`);
        setEmployee(response.data);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        alert("Failed to load employee details.");
      }
    };
    fetchEmployee();
  }, [id]);

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
      setEmployee({ ...employee, f_Image: file });
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
      if (key === "f_Course" && Array.isArray(employee[key])) {
        employee[key].forEach((course) => formData.append(key, course));
      } else if (key === "f_Image" && employee.f_Image) {
        formData.append(key, employee[key]);
      } else {
        formData.append(key, employee[key]);
      }
    });

    setIsLoading(true);

    try {
      await axios.put(`http://localhost:3000/edit-employees/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Employee updated successfully!");
      navigate("/employees");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update employee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-employee-container">
      <h2 className="edit-employee-title">Edit Employee</h2>
      <form className="edit-employee-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="f_Name"
            placeholder="Name"
            value={employee.f_Name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="f_Email"
            placeholder="Email"
            value={employee.f_Email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mobile No</label>
          <input
            type="text"
            name="f_Mobile"
            placeholder="Mobile"
            value={employee.f_Mobile}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Designation</label>
          <select
            name="f_Designation"
            value={employee.f_Designation}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Designation</option>
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Gender</label>
          <div className="form-radio-group">
            <label className="form-radio">
              <input
                type="radio"
                name="f_gender"
                value="M"
                onChange={handleChange}
                checked={employee.f_gender === "M"}
              />
              Male
            </label>
            <label className="form-radio">
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

        <div className="form-group">
          <label className="form-label">Course</label>
          <div className="form-checkbox-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="f_Course"
                value="MCA"
                onChange={handleChange}
                checked={employee.f_Course.includes("MCA")}
              />
              MCA
            </label>
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="f_Course"
                value="BCA"
                onChange={handleChange}
                checked={employee.f_Course.includes("BCA")}
              />
              BCA
            </label>
            <label className="form-checkbox">
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

        <div className="form-group">
          <label className="form-label">Image Upload</label>
          <input
            type="file"
            name="f_Image"
            onChange={handleChange}
            className="form-file-input"
          />
        </div>

        <div className="form-group">
          <button type="submit" className="form-submit-button" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {successMessage && <p className="form-success-message">{successMessage}</p>}
    </div>
  );
}

export default EditEmployee;
