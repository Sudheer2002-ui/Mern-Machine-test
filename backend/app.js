const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/employeeDB")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));

// Mongoose schemas and models
const sequenceSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  value: { type: Number },
});
const Sequence = mongoose.model("Sequence", sequenceSchema);

const employeeSchema = new mongoose.Schema({
  f_Id: { type: Number, unique: true, required: true },
  f_Image: String,
  f_Name: String,
  f_Email: { type: String, unique: true, required: true },
  f_Mobile: String,
  f_Designation: String,
  f_gender: String,
  f_Course: [String], // Array for courses
  f_CreateDate: { type: Date, default: Date.now },
});
const Employee = mongoose.model("Employee", employeeSchema);

// Initialize sequence
async function initializeSequence(name) {
  const sequence = await Sequence.findOne({ name });
  if (!sequence) {
    await Sequence.create({ name, value: 0 }); // Set starting value to 0
  }
}
initializeSequence('employeeId');

// Secret key for JWT
const SECRET_KEY = "your_secret_key";

// Authentication APIs (Register and Login)
app.post("/register", async (req, res) => {
  const { f_userName, f_Pwd } = req.body;
  if (!f_userName || !f_Pwd) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(f_Pwd, 10);
    const user = new User({ f_userName, f_Pwd: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { f_userName, f_Pwd } = req.body;
  if (!f_userName || !f_Pwd) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ f_userName });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(f_Pwd, user.f_Pwd);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign({ f_userName: user.f_userName }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Employee APIs (CRUD operations)
app.post("/employees", upload.single("f_Image"), async (req, res) => {
  try {
    const sequence = await Sequence.findOneAndUpdate(
      { name: 'employeeId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const f_Id = sequence.value;

    const newEmployee = new Employee({
      f_Id,
      f_Image: req.file ? req.file.path : null,
      f_Name: req.body.f_Name,
      f_Email: req.body.f_Email,
      f_Mobile: req.body.f_Mobile,
      f_Designation: req.body.f_Designation,
      f_gender: req.body.f_gender,
      f_Course: req.body.f_Course,
      f_CreateDate: req.body.f_CreateDate,
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

app.get("/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findOne({ f_Id: id });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

app.put("/edit-employees/:id", upload.single("f_Image"), async (req, res) => {
  const { id } = req.params;
  const updateData = {
    f_Name: req.body.f_Name,
    f_Email: req.body.f_Email,
    f_Mobile: req.body.f_Mobile,
    f_Designation: req.body.f_Designation,
    f_gender: req.body.f_gender,
    f_Course: req.body.f_Course,
    f_Image: req.file ? req.file.path : undefined,
  };

  try {
    const result = await Employee.updateOne({ f_Id: id }, { $set: updateData });
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json({ message: "Employee updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

app.delete("/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Employee.deleteOne({ f_Id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
