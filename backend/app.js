const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express(); // Initialize app here

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Now this is fine

const PORT = 3000;
const fs = require('fs');
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// Database Setup
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("Error connecting to SQLite database:", err.message);
  else console.log("Connected to SQLite database.");
});

// Create Tables if Not Exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS t_login (f_sno INTEGER PRIMARY KEY AUTOINCREMENT, f_userName TEXT UNIQUE NOT NULL, f_Pwd TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS t_Employee (f_Id INTEGER PRIMARY KEY AUTOINCREMENT, f_Image TEXT, f_Name TEXT NOT NULL, f_Email TEXT UNIQUE NOT NULL, f_Mobile TEXT NOT NULL, f_Designation TEXT, f_gender TEXT, f_Course TEXT, f_Createdate TEXT)`);
});

// Secret key for JWT
const SECRET_KEY = "your_secret_key";

// File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid duplicates
  },
});
const upload = multer({ storage });

// --- Authentication APIs ---
// Register
app.post("/register", async (req, res) => {
  const { f_userName, f_Pwd } = req.body;

  if (!f_userName || !f_Pwd) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(f_Pwd, 10);
    db.run(
      `INSERT INTO t_login (f_userName, f_Pwd) VALUES (?, ?)`,
      [f_userName, hashedPassword],
      (err) => {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ message: "Username already exists." });
          }
          return res.status(500).json({ message: "Database error.", error: err.message });
        }
        res.status(201).json({ message: "User registered successfully." });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Login
app.post("/login", (req, res) => {
  const { f_userName, f_Pwd } = req.body;

  if (!f_userName || !f_Pwd) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  db.get(`SELECT * FROM t_login WHERE f_userName = ?`, [f_userName], async (err, user) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });

    if (!user) return res.status(401).json({ message: "Invalid username or password." });

    const isMatch = await bcrypt.compare(f_Pwd, user.f_Pwd);
    if (!isMatch) return res.status(401).json({ message: "Invalid username or password." });

    const token = jwt.sign({ f_sno: user.f_sno, f_userName: user.f_userName }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful.", token });
  });
});

// --- Employee APIs ---
// Create Employee
app.post("/employees", upload.single("f_Image"), (req, res) => {
  const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course, f_Createdate } = req.body;
  const f_Image = req.file ? req.file.path : null;

  db.run(
    `INSERT INTO t_Employee (f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course, f_Createdate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course, f_Createdate],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ message: "Email already exists." });
        }
        return res.status(500).json({ message: "Database error.", error: err.message });
      }
      res.status(201).json({ message: "Employee added successfully.", f_Id: this.lastID });
    }
  );
});

// Read All Employees
app.get("/employees", (req, res) => {
  db.all(`SELECT * FROM t_Employee`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    res.status(200).json(rows);
  });
});

// Read Single Employee
app.get("/employees/:id", (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM t_Employee WHERE f_Id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    if (!row) return res.status(404).json({ message: "Employee not found." });
    res.status(200).json(row);
  });
});

// Update Employee
// Update Employee
app.put("/edit-employees/:id", upload.single("f_Image"), (req, res) => {
  const { id } = req.params;
  const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;
  const f_Image = req.file ? req.file.path : null; // Use new image if uploaded, else keep previous image

  // If no image is uploaded, keep the previous image path
  db.get(`SELECT f_Image FROM t_Employee WHERE f_Id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    
    const existingImage = row ? row.f_Image : null;

    const imagePath = f_Image || existingImage; // Use the uploaded image or keep the existing one if not updated

    db.run(
      `UPDATE t_Employee
       SET f_Name = ?, f_Email = ?, f_Mobile = ?, f_Designation = ?, f_gender = ?, f_Course = ?, f_Image = ?
       WHERE f_Id = ?`,
      [f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course, imagePath, id],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Database error.", error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "Employee not found." });
        }
        res.status(200).json({ message: "Employee updated successfully." });
      }
    );
  });
});


// Delete Employee
app.delete("/employees/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM t_Employee WHERE f_Id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: "Employee not found." });

    // Reset auto-increment to the highest ID value
    db.get("SELECT MAX(f_Id) AS maxId FROM t_Employee", [], (err, row) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err.message });
      const maxId = row.maxId || 0;
      db.run("UPDATE sqlite_sequence SET seq = ? WHERE name = 't_Employee'", [maxId], (err) => {
        if (err) return res.status(500).json({ message: "Error resetting auto-increment.", error: err.message });
        res.status(200).json({ message: "Employee deleted and auto-increment reset successfully." });
      });
    });
  });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
