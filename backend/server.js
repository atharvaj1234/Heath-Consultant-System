const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { initializeDatabase, getDb } = require("./database");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

dotenv.config();

const app = express();
const port = process.env.PORT || 5555;

// Security Enhancements
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//     message: "Too many requests from this IP, please try again after 15 minutes",
// });

app.use(helmet());
// app.use(limiter);
app.use(morgan("dev"));

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:5173"]; // Use an environment variable for production
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({ storage: storage });

// Initialize database
initializeDatabase()
  .then(() => {
    // Helper function to handle database errors
    const handleDatabaseError = (req, res, err, message) => {
      console.error(req.originalUrl + ": ", err.message);
      if (res && typeof res.status === "function") {
        return res.status(500).json({
          message: message || "Database operation failed",
          error: err.message,
        });
      } else {
        console.error("Response object is not valid:", res);
        return; // Or throw an error, depending on the desired behavior
      }
    };

    // Helper function to generate JWT token
    const generateToken = (user) => {
      return jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      ); // Use environment variable for secret
    };

    // User Registration
    app.post(
      "/api/register",
      upload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "certificates", maxCount: 10 }, // Allow up to 10 certificates
      ]),
      [
        body("fullName").notEmpty().withMessage("Full name is required"),
        body("email").isEmail().withMessage("Invalid email address"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
        body("role")
          .isIn(["user", "consultant", "admin"]) //Removed admin role from here
          .withMessage("Invalid role selected"),
        body("phone").notEmpty().withMessage("Phone number is required"), //Added phone validation
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {
          fullName,
          email,
          password,
          role,
          phone, //Get the phone number here
          bloodGroup,
          medicalHistory,
          currentPrescriptions,
          bio, // Consultant specific
          qualification, // Consultant specific
          areasOfExpertise,
          speciality, // Consultant specific
          availability, // Consultant specific
          bankAccount, // Consultant Specific
          consultingFees, // Consultant Specific
        } = req.body;

        const profilePicture =
          req.files && req.files["profilePicture"]
            ? req.files["profilePicture"][0].path
            : null;

        let certificatesData = [];

        if (req.files && req.files["certificates"]) {
          const certificates = Array.isArray(req.files["certificates"])
            ? req.files["certificates"]
            : [req.files["certificates"]];

          try {
            const certificateNames = JSON.parse(req.body.certificateNames); // Parse certificate names from request body
            certificatesData = certificates.map((file, index) => ({
              name: certificateNames[index] || file.originalname, // Use provided name or original filename
              path: file.path,
            }));
          } catch (error) {
            console.error("Error parsing certificateNames:", error);
            return res
              .status(400)
              .json({ message: "Invalid certificate names format" });
          }
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const pool = getDb(); // Get the connection pool
          const connection = await pool.getConnection(); // Get a connection from the pool

          try {
            const isConsultant = role === "consultant" ? 1 : 0; // Set isConsultant flag

            // Construct the SQL query dynamically
            let sql =
              "INSERT INTO users (fullName, email, password, role, phone, isConsultant, profilePicture";
            let values = [
              fullName,
              email,
              hashedPassword,
              role,
              phone,
              isConsultant,
              profilePicture,
            ];

            // Add fields based on role
            if (role === "user") {
              sql +=
                ", bloodGroup, medicalHistory, currentPrescriptions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
              values.push(bloodGroup, medicalHistory, currentPrescriptions);
            } else if (role === "consultant") {
              sql +=
                ", bio, qualification, areasOfExpertise, speciality, availability, bankAccount, consultingFees, certificates, isApproved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
              values.push(
                bio,
                qualification,
                areasOfExpertise,
                speciality,
                availability,
                bankAccount,
                consultingFees,
                JSON.stringify(certificatesData),
                0
              ); // isApproved default 0
            } else {
              sql += ") VALUES (?, ?, ?, ?, ?, ?, ?)"; //role = admin
            }

            // Execute the SQL query
            const [result] = await connection.query(sql, values);
            const userId = result.insertId;

            // Send successful response
            res.status(201).json({
              id: userId,
              fullName,
              email,
              phone,
              role,
              isConsultant,
              isApproved: 0,
              profilePicture,
            });
          } finally {
            connection.release(); // Release the connection back to the pool
          }
        } catch (error) {
          console.error(error);
          if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }
          res
            .status(500)
            .json({ message: "Registration failed", error: error.message });
        }
      }
    );

    // User Login
    app.post(
      "/api/login",
      [
        body("email").isEmail().withMessage("Invalid email address"),
        body("password").notEmpty().withMessage("Password is required"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
          const pool = getDb();
          const connection = await pool.getConnection();

          try {
            const [rows] = await connection.query(
              "SELECT * FROM users WHERE email = ?",
              [email]
            );
            const user = rows[0];

            if (!user) {
              return res.status(400).json({ message: "Invalid credentials" });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
              return res.status(400).json({ message: "Invalid credentials" });
            }

            const token = generateToken(user);
            res.json({
              token,
              role: user.role,
              userId: user.id,
              isConsultant: user.isConsultant,
              isApproved: user.isApproved,
              profilePicture: user.profilePicture,
            });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ message: "Login failed", error: error.message });
        }
      }
    );

    // Authentication Middleware
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid token", error: err.message });
        }
        req.user = user;
        next();
      });
    };

    // Endpoint to fetch consultant's documents
    app.get("/api/consultant/:consultantId/documents", async (req, res) => {
      const { consultantId } = req.params;

      try {
        const pool = getDb();
        const connection = await pool.getConnection();

        try {
          // Fetch user by ID
          const [rows] = await connection.query(
            "SELECT certificates FROM users WHERE id = ? AND role = 'consultant'",
            [consultantId]
          );

          const row = rows[0];

          if (!row) {
            return res.status(404).json({
              message: "Consultant not found or does not have documents.",
            });
          }
          // Parse the certificates from string to array
          const certificates = JSON.parse(row.certificates) || [];

          res.status(200).json({ certificates });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to fetch consultant documents",
            error: error.message,
          });
      }
    });

    // User Payments API (GET)
    app.get("/api/user/payments", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      try {
        const pool = getDb();
        const connection = await pool.getConnection();

        try {
          const [payments] = await connection.query(
            `SELECT
                          p.*,
                          b.date AS bookingDate,
                          b.time AS bookingTime,
                          r.refundAmount AS refundAmount
                        FROM
                          payments p
                        INNER JOIN
                          bookings b ON p.bookingId = b.id
                        LEFT JOIN
                          refunds r ON p.id = r.paymentId
                        WHERE
                          p.userId = ?`,
            [userId]
          );

          // Process payments to calculate final amount
          const processedPayments = payments.map((payment) => {
            let finalAmount = payment.amount;
            if (payment.status === "refunded" && payment.refundAmount) {
              finalAmount -= payment.refundAmount; // Make the refund amount negative
            }

            return {
              ...payment,
              finalAmount: finalAmount,
            };
          });

          res.json(processedPayments);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve payments",
            error: error.message,
          });
      }
    });

    // Consultant Earnings API (GET)
    app.get("/api/consultant/earnings", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      try {
        const pool = getDb();
        const connection = await pool.getConnection();

        try {
          const [earnings] = await connection.query(
            `
                        SELECT p.*, b.date as bookingDate, b.time as bookingTime
                        FROM payments p
                        INNER JOIN bookings b ON p.bookingId = b.id
                        WHERE b.consultantId = ?
                        AND p.status = 'paid'
                        AND b.status NOT IN ('rejected', 'canceled')  -- Exclude rejected and cancelled bookings
                        `,
            [userId]
          );

          res.json(earnings);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve earnings",
            error: error.message,
          });
      }
    });

    // User Profile (GET)
    app.get("/api/profile", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      try {
        const pool = getDb();
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.query(
            `SELECT
                        id,
                        fullName,
                        email,
                        role,
                        phone,
                        profilePicture,
                        bloodGroup,
                        medicalHistory,
                        currentPrescriptions,
                        isConsultant,
                        bio,
                        qualification,
                        areasOfExpertise,
                        speciality,
                        availability,
                        bankAccount,
                        isApproved
                    FROM users WHERE id = ?`,
            [userId]
          );
          const user = rows[0];
          if (!user) {
            return res.status(404).json({ message: "Profile not found" });
          }
          res.json(user);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve profile",
            error: error.message,
          });
      }
    });

    // User Profile (PUT)
    app.put(
      "/api/profile",
      upload.single("profilePicture"),
      authenticateToken,
      [
        body("fullName")
          .optional()
          .notEmpty()
          .withMessage("Full name is required"),
        body("email").optional().isEmail().withMessage("Invalid email address"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const {
          fullName,
          email,
          bloodGroup,
          medicalHistory,
          currentPrescriptions,
          phone,
          bio,
          qualification,
          areasOfExpertise,
          speciality,
          availability,
          bankAccount,
        } = req.body;
        const profilePicture = req.file ? req.file.path : null;

        try {
          const pool = getDb();
          const connection = await pool.getConnection();

          try {
            let sql = "UPDATE users SET ";
            const values = [];

            // Only include non-null or non-empty fields in the update query
            if (fullName && fullName.trim() !== "") {
              sql += "fullName = ?, ";
              values.push(fullName);
            }

            if (email && email.trim() !== "") {
              sql += "email = ?, ";
              values.push(email);
            }

            if (req.user.role === "user") {
              if (bloodGroup && bloodGroup.trim() !== "") {
                sql += "bloodGroup = ?, ";
                values.push(bloodGroup);
              }

              if (medicalHistory && medicalHistory.trim() !== "") {
                sql += "medicalHistory = ?, ";
                values.push(medicalHistory);
              }

              if (currentPrescriptions && currentPrescriptions.trim() !== "") {
                sql += "currentPrescriptions = ?, ";
                values.push(currentPrescriptions);
              }
            } else if (req.user.role === "consultant") {
              if (phone && phone.trim() !== "") {
                sql += "phone = ?, ";
                values.push(phone);
              }

              if (bio && bio.trim() !== "") {
                sql += "bio = ?, ";
                values.push(bio);
              }

              if (qualification && qualification.trim() !== "") {
                sql += "qualification = ?, ";
                values.push(qualification);
              }

              if (areasOfExpertise && areasOfExpertise.trim() !== "") {
                sql += "areasOfExpertise = ?, ";
                values.push(areasOfExpertise);
              }

              if (speciality && speciality.trim() !== "") {
                sql += "speciality = ?, ";
                values.push(speciality);
              }

              if (availability && availability.trim() !== "") {
                sql += "availability = ?, ";
                values.push(availability);
              }

              if (bankAccount && bankAccount.trim() !== "") {
                sql += "bankAccount = ?, ";
                values.push(bankAccount);
              }
            }

            // Only update profilePicture if provided (not null)
            if (profilePicture) {
              sql += "profilePicture = ?, ";
              values.push(profilePicture);
            }

            // Remove the trailing comma and space
            sql = sql.slice(0, -2);

            // Add the WHERE condition
            sql += " WHERE id = ?";

            // Push userId to the values array
            values.push(userId);

            await connection.query(sql, values);
            res.json({ id: userId, fullName, email, profilePicture });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to update profile",
              error: error.message,
            });
        }
      }
    );

    // Consultant Profile (GET)
    app.get("/api/consultant/profile", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      try {
        const pool = getDb();
        const connection = await pool.getConnection();

        try {
          // First, check if the user is a consultant
          const [rows] = await connection.query(
            "SELECT * FROM users WHERE id = ? AND isConsultant = 1",
            [userId]
          );

          const user = rows[0];

          if (!user) {
            return res
              .status(403)
              .json({ message: "User is not a consultant" });
          }

          // If the user is a consultant, retrieve the consultant profile
          res.json(user);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to get consultant profile",
            error: error.message,
          });
      }
    });

    app.put(
      "/api/consultant/profile",
      authenticateToken,
      [
        body("specialty").notEmpty().withMessage("Specialty is required"),
        body("specialty")
          .isLength({ max: 50 })
          .withMessage("Specialty must be less than 50 characters"),
        body("qualifications")
          .notEmpty()
          .withMessage("Qualifications are required"),
        body("availability").notEmpty().withMessage("Availability is required"),
        body("bio").optional().isString().withMessage("Bio must be a string"),
        body("areasOfExpertise")
          .optional()
          .isString()
          .withMessage("Areas of expertise must be a string"),
        body("fullName").notEmpty().withMessage("Full name is required"),
        body("profilePicture")
          .optional()
          .isURL()
          .withMessage("Profile picture must be a valid URL"),
      ],
      async (req, res) => {
        const userId = req.user.userId;
        const {
          specialty,
          qualifications,
          availability,
          bio,
          areasOfExpertise,
          fullName,
          profilePicture,
        } = req.body; // Extract all fields from the request body

        try {
          const pool = getDb();
          const connection = await pool.getConnection();

          try {
            // Verify if the user is a consultant before updating the profile
            const [rows] = await connection.query(
              "SELECT isConsultant FROM users WHERE id = ?",
              [userId]
            );

            const user = rows[0];

            if (!user || user.isConsultant !== 1) {
              return res
                .status(403)
                .json({ message: "User is not a consultant" });
            }

            // Update the consultant profile (Corrected field name: 'speciality' to 'specialty')
            await connection.query(
              `UPDATE users SET
                        fullName = ?,
                        speciality = ?,  -- Corrected field name
                        qualification = ?,
                        availability = ?,
                        bio = ?,
                        areasOfExpertise = ?,
                        profilePicture = ?
                    WHERE id = ?`,
              [
                fullName,
                specialty,
                qualifications,
                availability,
                bio,
                areasOfExpertise,
                profilePicture,
                userId,
              ]
            );

            res.json({
              userId,
              fullName,
              specialty,
              qualifications,
              availability,
              bio,
              areasOfExpertise,
              profilePicture,
            });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to update consultant profile",
              error: error.message,
            });
        }
      }
    );
    // List Consultants (GET)
    app.get("/api/consultants", async (req, res) => {
      const { specialty, rating, availability } = req.query;
      let query =
        "SELECT * FROM users WHERE isConsultant = 1 AND isApproved = 1"; // Start with a base query

      const params = [];
      if (specialty) {
        query += " AND speciality LIKE ?";
        params.push(`%${specialty}%`);
      }
      // if (availability) {
      //   query += " AND availability LIKE ?";
      //   params.push(`%${availability}%`);
      // }

      try {
        const pool = getDb();
        const connection = await pool.getConnection();

        try {
          const [consultants] = await connection.query(query, params);
          res.json(consultants);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error.message);
        return res
          .status(500)
          .json({ message: "Failed to retrieve consultants" });
      }
    });

    // Send Chat Request (POST)
    app.post("/api/chat/request", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      const { consultantId, bookingId, message } = req.body;
      const pool = getDb();

      try {
        const connection = await pool.getConnection();
        try {
          // Verify booking exists and belongs to user
          const [bookingRows] = await connection.query(
            "SELECT 1 FROM bookings WHERE id = ? AND userId = ? AND consultantId = ?",
            [bookingId, userId, consultantId]
          );
          if (bookingRows.length === 0) {
            return res
              .status(403)
              .json({ message: "Invalid booking or unauthorized" });
          }

          // Check if payment is valid
          const [paymentRows] = await connection.query(
            "SELECT 1 FROM payments WHERE bookingId = ? AND userId = ? AND status = 'paid'",
            [bookingId, userId]
          );
          if (paymentRows.length === 0) {
            return res
              .status(403)
              .json({ message: "Payment not found or not paid" });
          }

          // Create the chat request
          const [chatRequestResult] = await connection.query(
            "INSERT INTO chat_requests (userId, consultantId, bookingId) VALUES (?, ?, ?)",
            [userId, consultantId, bookingId]
          );
          const chatRequestId = chatRequestResult.insertId;

          // Insert the first message
          await connection.query(
            "INSERT INTO chats (chatRequestId, senderId, message) VALUES (?, ?, ?)",
            [chatRequestId, userId, message]
          );

          res.status(201).json({
            message: "Chat request sent and message sent successfully",
            chatRequestId,
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to send chat request",
            error: error.message,
          });
      }
    });

    // Get Chat Requests for a User (GET)
    app.get("/api/chat/requests", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      const pool = getDb();

      try {
        const connection = await pool.getConnection();
        try {
          // Determine the user's role (consultant or other)
          const [userRows] = await connection.query(
            "SELECT isConsultant FROM users WHERE id = ?",
            [userId]
          );
          const user = userRows[0];

          let query = `
                SELECT cr.*, u.fullName as userName, u.profilePicture as userProfilePicture, cu.fullName as consultantName, cu.profilePicture as consultantProfilePicture, b.date as bookingDate, b.time as bookingTime
                FROM chat_requests cr
                INNER JOIN users u ON cr.userId = u.id
                INNER JOIN users cu ON cr.consultantId = cu.id
                INNER JOIN bookings b ON cr.bookingId = b.id
                WHERE `;

          const params = [];

          if (user && user.isConsultant === 1) {
            // Consultant: Get all requests *for* this consultant
            query += "cr.consultantId = ?";
            params.push(userId);
          } else {
            // User: Get all requests *from* this user
            query += "cr.userId = ?";
            params.push(userId);
          }

          // Retrieve all messages
          const [requests] = await connection.query(query, params);
          res.json(requests);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve chat requests",
            error: error.message,
          });
      }
    });

    app.get(
      "/api/chat/requestStatus/:consultantId",
      authenticateToken,
      async (req, res) => {
        const userId = req.user.userId;
        const { consultantId } = req.params;
        const pool = getDb();

        try {
          const connection = await pool.getConnection();
          try {
            const [rows] = await connection.query(
              "SELECT * FROM chat_requests WHERE userId = ? AND consultantId = ?",
              [userId, consultantId]
            );
            const request = rows[0];

            if (!request) {
              return res.json({ message: "No Chat Requests" });
            }
            res.json({ request });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to retrieve chat request status",
              error: error.message,
            });
        }
      }
    );

    // Accept/Reject Chat Request (PUT)
    app.put(
      "/api/chat/requests/:requestId",
      authenticateToken,
      async (req, res) => {
        const { requestId } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'
        const userId = req.user.userId; // Consultant id
        const pool = getDb();

        if (!["accepted", "rejected"].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }

        try {
          const connection = await pool.getConnection();
          try {
            const [userRows] = await connection.query(
              "SELECT isConsultant FROM users WHERE id = ?",
              [userId]
            );
            const user = userRows[0];

            if (!user || user.isConsultant !== 1) {
              return res
                .status(403)
                .json({ message: "User is not a consultant" });
            }

            const [updateResult] = await connection.query(
              "UPDATE chat_requests SET status = ? WHERE id = ? AND consultantId = ?",
              [status, requestId, userId]
            );

            if (updateResult.affectedRows === 0) {
              return res.status(404).json({
                message: "Chat request not found or unauthorized",
              });
            }

            res.json({ message: "Chat request updated successfully" });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to update chat request",
              error: error.message,
            });
        }
      }
    );

    // Get Messages for a Chat (GET)
    app.get(
      "/api/chat/:chatRequestId/messages",
      authenticateToken,
      async (req, res) => {
        const { chatRequestId } = req.params;
        const userId = req.user.userId;
        const pool = getDb();

        try {
          const connection = await pool.getConnection();
          try {
            // Validate user is part of this chat
            const [chatRequestRows] = await connection.query(
              `SELECT 1 FROM chat_requests WHERE id = ? AND (userId = ? OR consultantId = ?)`,
              [chatRequestId, userId, userId]
            );
            if (chatRequestRows.length === 0) {
              return res
                .status(403)
                .json({ message: "Unauthorized to access this chat" });
            }

            // Fetch messages
            const [messages] = await connection.query(
              "SELECT * FROM chats WHERE chatRequestId = ? ORDER BY timestamp",
              [chatRequestId]
            );
            res.json(messages);
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to retrieve messages",
              error: error.message,
            });
        }
      }
    );

    // Send Message (POST)
    app.post(
      "/api/chat/:chatRequestId/messages",
      authenticateToken,
      async (req, res) => {
        const { chatRequestId } = req.params;
        const { message } = req.body;
        const senderId = req.user.userId;
        const pool = getDb();

        try {
          const connection = await pool.getConnection();
          try {
            // Validate user is part of this chat
            const [chatRequestRows] = await connection.query(
              `SELECT 1 FROM chat_requests WHERE id = ? AND (userId = ? OR consultantId = ?) AND status = 'accepted'`,
              [chatRequestId, senderId, senderId]
            );
            if (chatRequestRows.length === 0) {
              return res.status(403).json({
                message: "Unauthorized to send messages in this chat",
              });
            }

            // Insert message
            const [insertResult] = await connection.query(
              "INSERT INTO chats (chatRequestId, senderId, message) VALUES (?, ?, ?)",
              [chatRequestId, senderId, message]
            );
            const messageId = insertResult.insertId;
            res.status(201).json({
              message: "Message sent successfully",
              messageId: messageId,
            });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ message: "Failed to send message", error: error.message });
        }
      }
    );

    // Reviews (POST)
    app.post(
      "/api/reviews",
      authenticateToken,
      [
        body("consultantId")
          .notEmpty()
          .withMessage("Consultant ID is required"),
        body("rating")
          .isInt({ min: 1, max: 5 })
          .withMessage("Rating must be between 1 and 5"),
        body("review").notEmpty().withMessage("Review text is required"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { consultantId, rating, review } = req.body;
        const pool = getDb();

        try {
          const connection = await pool.getConnection();
          try {
            //Verify user
            const [bookingRows] = await connection.query(
              "SELECT * FROM bookings WHERE userId = ? AND consultantId = ?",
              [userId, consultantId]
            );

            if (bookingRows.length === 0) {
              return res.status(403).json({
                message: "You can't post review without an appointment",
              });
            }
            const [insertResult] = await connection.query(
              "INSERT INTO reviews (userId, consultantId, rating, review) VALUES (?, ?, ?, ?)",
              [userId, consultantId, rating, review]
            );
            const reviewId = insertResult.insertId;
            res
              .status(201)
              .json({ id: reviewId, userId, consultantId, rating, review });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ message: "Failed to create review", error: error.message });
        }
      }
    );

    // Get Consultant by ID (GET)
    app.get("/api/consultants/:id", async (req, res) => {
      const consultantId = req.params.id;
      const pool = getDb();
      try {
        const connection = await pool.getConnection();
        try {
          const [consultantRows] = await connection.query(
            "SELECT * FROM users WHERE id = ? AND isConsultant = 1",
            [consultantId]
          );
          const consultant = consultantRows[0];

          if (!consultant) {
            return res.status(404).json({ message: "Consultant not found" });
          }
          const [reviews] = await connection.query(
            "SELECT * FROM reviews WHERE consultantId = ?",
            [consultantId]
          );
          res.json({
            consultant,
            reviews,
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve consultant",
            error: error.message,
          });
      }
    });

    // Bookings (GET)
    app.get("/api/bookings", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      const pool = getDb();

      try {
        const connection = await pool.getConnection();
        try {
          const [bookings] = await connection.query(
            "SELECT * FROM bookings WHERE userId = ?",
            [userId]
          );
          res.json(bookings);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve bookings",
            error: error.message,
          });
      }
    });

    // Booking acceptance route
    app.put("/api/bookings/:id/accept", authenticateToken, async (req, res) => {
      const bookingId = req.params.id;
      const pool = getDb();

      try {
        const connection = await pool.getConnection();
        try {
          const [bookingRows] = await connection.query(
            "SELECT consultantId, date, time FROM bookings WHERE id = ?",
            [bookingId]
          );
          const booking = bookingRows[0];

          if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
          }
          const [conflictRows] = await connection.query(
            "SELECT COUNT(*) AS count FROM bookings WHERE consultantId = ? AND date = ? AND time = ? AND status = 'accepted'",
            [booking.consultantId, booking.date, booking.time]
          );

          if (conflictRows[0].count > 0) {
            return res.status(400).json({
              message: "This timeslot is already booked by another booking.",
            });
          }

          const [updateResult] = await connection.query(
            "UPDATE bookings SET status = 'accepted' WHERE id = ?",
            [bookingId]
          );

          if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
          }

          res.json({ message: "Booking accepted successfully" });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "Failed to accept booking", error: error.message });
      }
    });

    app.put("/api/bookings/:id/cancel", authenticateToken, async (req, res) => {
      const bookingId = req.params.id;
      const pool = getDb();

      try {
        const connection = await pool.getConnection();
        try {
          const [bookingRows] = await connection.query(
            "SELECT consultantId, date, time FROM bookings WHERE id = ?",
            [bookingId]
          );
          const booking = bookingRows[0];

          if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
          }
          const [updateResult] = await connection.query(
            "UPDATE bookings SET status = 'canceled' WHERE id = ?",
            [bookingId]
          );
          if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
          }
          const [paymentRows] = await connection.query(
            "SELECT id, amount FROM payments WHERE bookingId = ?",
            [bookingId]
          );
          const payment = paymentRows[0];

          if (payment) {
            // Calculating the refund amount and inserting the details
            const refundAmount = (
              (payment.amount - ((payment.amount * 18) / 100 + 25)) *
              0.95
            ).toFixed(2); // Deducting a 5% cancellation fee, platform fees and gst

            const [refundInsertResult] = await connection.query(
              "INSERT INTO refunds (paymentId, refundDate, refundAmount, reason) VALUES (?, ?, ?, ?)",
              [
                payment.id,
                new Date().toISOString(),
                refundAmount,
                "Booking cancellation",
              ]
            );

            // Update the payment status to refunded after the refund amount calculation
            await connection.query(
              "UPDATE payments SET status = 'refunded' WHERE bookingId = ?",
              [bookingId]
            );

            res.json({
              message: "Booking canceled successfully",
              refundId: refundInsertResult.insertId,
            });
          } else {
            return res.status(404).json({ message: "Payment not found" });
          }
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "Failed to cancel booking", error: error.message });
      }
    });

    app.put("/api/bookings/:id/reject", authenticateToken, async (req, res) => {
      const bookingId = req.params.id;
      const pool = getDb();
      // pass a parameter here something like rejected_from_payment_pending

      try {
        const connection = await pool.getConnection();
        try {
          const [bookingRows] = await connection.query(
            "SELECT consultantId, date, time, userId FROM bookings WHERE id = ?",
            [bookingId]
          );
          const booking = bookingRows[0];

          if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
          }
          const [updateResult] = await connection.query(
            "UPDATE bookings SET status = 'rejected' WHERE id = ?",
            [bookingId]
          );

          if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
          }

          // Refund logic (similar to cancel route)
          const [paymentRows] = await connection.query(
            "SELECT id, amount FROM payments WHERE bookingId = ?",
            [bookingId]
          );
          const payment = paymentRows[0];

          if (payment) {
            // Calculating the refund amount and inserting the details
            const refundAmount =
              payment.amount - ((payment.amount * 18) / 100 + 25); // Deducting gst and platform fees

            const [refundInsertResult] = await connection.query(
              "INSERT INTO refunds (paymentId, refundDate, refundAmount, reason) VALUES (?, ?, ?, ?)",
              [
                payment.id,
                new Date().toISOString(),
                refundAmount,
                "Booking rejection",
              ]
            );

            // Update the payment status to refunded after the refund amount calculation
            await connection.query(
              "UPDATE payments SET status = 'refunded' WHERE bookingId = ?",
              [bookingId]
            );
            res.json({
              message: "Booking rejected successfully",
              refundId: refundInsertResult.insertId,
            });
          } else {
            return res.status(404).json({ message: "Payment not found" });
          }
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "Failed to reject booking", error: error.message });
      }
    });

    app.post(
      "/api/booking/payment",
      authenticateToken,
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { paymentId } = req.body;
        const pool = getDb();
        try {
          const connection = await pool.getConnection();
          try {
            await connection.query(
              "UPDATE payments SET status = 'paid' WHERE id = ?",
              [paymentId]
            );
            res.status(201).json({
              id: paymentId,
            });
          } catch (parseError) {
            console.error("Error parsing data:", parseError);
            return res
              .status(500)
              .json({ message: "Failed to parse data" });
          }
          connection.release();
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to create booking",
              error: error.message,
            });
        }
      }
    );

    app.post(
      "/api/booking/request",
      authenticateToken,
      [
        body("consultantId")
          .notEmpty()
          .withMessage("Consultant ID is required"),
        body("date").notEmpty().withMessage("Date is required"),
        body("time").notEmpty().withMessage("Time is required"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { consultantId, date, time, status = "pending" } = req.body;

        // Validate that the consultantId is a valid integer
        if (isNaN(consultantId)) {
          return res
            .status(400)
            .json({ message: "Invalid consultant ID. Must be a number." });
        }
        const pool = getDb();
        try {
          const connection = await pool.getConnection();
          try {
            // Fetch consultant information, including availability and consultingFees
            const [consultantRows] = await connection.query(
              "SELECT availability, consultingFees, speciality FROM users WHERE id = ? AND isConsultant = 1",
              [consultantId]
            );

            const consultant = consultantRows[0];

            if (!consultant) {
              return res.status(404).json({ message: "Consultant not found." });
            }
            try {
              // Validate that the specified time is in the consultant's availability
              let availableTimes = JSON.parse(consultant.availability);
              const bookingDay = new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
              });

              // Check if bookingDay is a valid day of the week
              if (!availableTimes.hasOwnProperty(bookingDay)) {
                return res.status(400).json({
                  message:
                    "Consultant is not available on the specified day. Check days with consultant.",
                });
              }

              // Validate that time is in the consultant's availability
              const validTimes = availableTimes[bookingDay];
              if (
                !validTimes ||
                validTimes.startTime > time ||
                validTimes.endTime < time
              ) {
                return res.status(400).json({
                  message:
                    "Consultant is not available on the specified time. Check valid times.",
                });
              }

              // Additional validation
              const [countRows] = await connection.query(
                "SELECT COUNT(*) AS count FROM bookings WHERE consultantId = ? AND date = ? AND time = ? AND status = 'accepted'",
                [consultantId, date, time]
              );
              if (countRows[0].count > 0) {
                return res.status(400).json({
                  message:
                    "Consultant is already booked for this date and time.",
                });
              }

              const [userCountRows] = await connection.query(
                "SELECT COUNT(*) AS count FROM bookings WHERE userId = ? AND date = ? AND time = ?",
                [userId, date, time]
              );

              if (userCountRows[0].count > 0) {
                return res.status(400).json({
                  message: "You already have a booking for this date and time.",
                });
              }

              const [insertResult] = await connection.query(
                "INSERT INTO bookings (userId, consultantId, date, time, status) VALUES (?, ?, ?, ?, ?)",
                [userId, consultantId, date, time, status]
              );
              const bookingId = insertResult.insertId;
              const paymentDate = new Date().toISOString();
              const amount = (
                Number(consultant.consultingFees) +
                (Number(consultant.consultingFees) * 18) / 100 +
                25
              ).toFixed(2); // Using consultingFees from users table
              // Insert payment information into the payments table
              const [paymentInsertResult] = await connection.query(
                "INSERT INTO payments (bookingId, userId, amount, paymentDate, status) VALUES (?, ?, ?, ?, ?)",
                [bookingId, userId, amount, paymentDate, "pending"]
              );
              const paymentId = paymentInsertResult.insertId;
              res.status(201).json({
                id: bookingId,
                userId,
                consultantId,
                date,
                time,
                status,
                paymentId,
              });
            } catch (parseError) {
              console.error("Error parsing availability data:", parseError);
              return res
                .status(500)
                .json({ message: "Failed to parse availability data" });
            }
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to create booking",
              error: error.message,
            });
        }
      }
    );

    // API to Fetch Consultant Availability
    app.get("/api/consultant/:consultantId/availability", async (req, res) => {
      const consultantId = req.params.consultantId;
      const pool = getDb();

      try {
        const connection = await pool.getConnection();
        try {
          const [consultantRows] = await connection.query(
            "SELECT availability FROM users WHERE id = ? AND isConsultant = 1",
            [consultantId]
          );
          const consultant = consultantRows[0];

          if (!consultant) {
            return res.status(404).json({ message: "Consultant not found" });
          }
          try {
            const availability = JSON.parse(consultant.availability);
            res.json(availability);
          } catch (error) {
            return res
              .status(500)
              .json({ message: "Failed to parse availability data" });
          }
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to get consultant availability",
            error: error.message,
          });
      }
    });

    // Health Records (GET and POST)
    app.get("/api/healthrecords", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      const { userId1 } = req.query; // FIXED: Use query instead of body

      try {
        const pool = getDb();
        const connection = await pool.getConnection();
        try {
          const [healthrecords] = await connection.query(
            "SELECT * FROM healthrecords WHERE userId = ?",
            [userId1 ? userId1 : userId]
          );

          res.json(healthrecords);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve health records",
            error: error.message,
          });
      }
    });

    app.post(
      "/api/healthrecords",
      authenticateToken,
      [
        body("medicalHistory")
          .notEmpty()
          .withMessage("Medical history is required"),
        body("ongoingTreatments")
          .notEmpty()
          .withMessage("Ongoing treatments are required"),
        body("prescriptions")
          .notEmpty()
          .withMessage("Prescriptions are required"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { medicalHistory, ongoingTreatments, prescriptions } = req.body;

        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            const [insertResult] = await connection.query(
              "INSERT INTO healthrecords (userId, medicalHistory, ongoingTreatments, prescriptions) VALUES (?, ?, ?, ?)",
              [userId, medicalHistory, ongoingTreatments, prescriptions]
            );
            const recordId = insertResult.insertId;
            res.status(201).json({
              id: recordId,
              userId,
              medicalHistory,
              ongoingTreatments,
              prescriptions,
            });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to create health record",
              error: error.message,
            });
        }
      }
    );

    // Messages (GET and POST)
    app.get("/api/messages", authenticateToken, async (req, res) => {
      const userId = req.user.userId;

      try {
        const pool = getDb();
        const connection = await pool.getConnection();

        try {
          const [messages] = await connection.query(
            "SELECT * FROM messages WHERE userId = ?",
            [userId]
          );
          res.json(messages);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve messages",
            error: error.message,
          });
      }
    });

    app.post(
      "/api/messages",
      authenticateToken,
      [
        body("consultantId")
          .notEmpty()
          .withMessage("Consultant ID is required"),
        body("message").notEmpty().withMessage("Message text is required"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.userId;
        const { consultantId, message } = req.body;
        const timestamp = new Date().toISOString();
        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            const [insertResult] = await connection.query(
              "INSERT INTO messages (userId, consultantId, message, timestamp) VALUES (?, ?, ?, ?)",
              [userId, consultantId, message, timestamp]
            );
            const messageId = insertResult.insertId;
            res.status(201).json({
              id: messageId,
              userId,
              consultantId,
              message,
              timestamp,
            });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to create message",
              error: error.message,
            });
        }
      }
    );

    // Payments (GET)
    app.get("/api/payments", authenticateToken, async (req, res) => {
      const userId = req.user.userId;

      try {
        const pool = getDb();
        const connection = await pool.getConnection();
        try {
          // Check if the user is an admin
          const [userRows] = await connection.query(
            "SELECT role FROM users WHERE id = ?",
            [userId]
          );
          const user = userRows[0];

          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          let payments;
          if (user.role === "admin") {
            // If the user is an admin, return all payments
            [payments] = await connection.query("SELECT * FROM payments");
          } else {
            // If the user is not an admin, return only their payments
            [payments] = await connection.query(
              "SELECT * FROM payments WHERE userId = ?",
              [userId]
            );
          }
          res.json(payments);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve payments",
            error: error.message,
          });
      }
    });

    // Reviews (POST)
    app.post(
      "/api/reviews",
      authenticateToken,
      [
        body("consultantId")
          .notEmpty()
          .withMessage("Consultant ID is required"),
        body("rating")
          .isInt({ min: 1, max: 5 })
          .withMessage("Rating must be between 1 and 5"),
        body("review").notEmpty().withMessage("Review text is required"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.userId;
        const { consultantId, rating, review } = req.body;

        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            const [insertResult] = await connection.query(
              "INSERT INTO reviews (userId, consultantId, rating, review) VALUES (?, ?, ?, ?)",
              [userId, consultantId, rating, review]
            );
            const reviewId = insertResult.insertId;
            res
              .status(201)
              .json({ id: reviewId, userId, consultantId, rating, review });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ message: "Failed to create review", error: error.message });
        }
      }
    );

    // Admin Authentication Middleware
    const authenticateAdmin = (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid token", error: err.message });
        }
        if (user.role !== "admin") {
          return res
            .status(403)
            .json({ message: "Unauthorized: Admin access required" });
        }
        req.user = user;
        next();
      });
    };

    // Admin - Get All Users
    app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
      try {
        const pool = getDb();
        const connection = await pool.getConnection();
        try {
          const [users] = await connection.query(
            "SELECT id, fullName, email, role, isConsultant, bloodGroup, medicalHistory, currentPrescriptions, phone, areasOfExpertise, isApproved, profilePicture FROM users WHERE isConsultant = 0"
          );
          res.json(users);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "Failed to retrieve users", error: error.message });
      }
    });

    // Admin - Get All Consultants
    app.get("/api/admin/consultants", authenticateAdmin, async (req, res) => {
      try {
        const pool = getDb();
        const connection = await pool.getConnection();
        try {
          const [consultants] = await connection.query(
            "SELECT * FROM users WHERE isConsultant = 1"
          );
          res.json(consultants);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve consultants",
            error: error.message,
          });
      }
    });

    // Admin - Get All Bookings
    app.get("/api/admin/bookings", authenticateAdmin, async (req, res) => {
      try {
        const pool = getDb();
        const connection = await pool.getConnection();
        try {
          const [bookings] = await connection.query("SELECT * FROM bookings");
          res.json(bookings);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve bookings",
            error: error.message,
          });
      }
    });

    // Contact Form Submission (POST)
    app.post(
      "/api/contact",
      [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Invalid email address"),
        body("subject").notEmpty().withMessage("Subject is required"),
        body("message").notEmpty().withMessage("Message is required"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, subject, message } = req.body;

        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            await connection.query(
              "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
              [name, email, subject, message]
            );
            res
              .status(200)
              .json({ message: "Contact form submitted successfully" });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to submit contact form",
              error: error.message,
            });
        }
      }
    );

    // Consultant Bookings Route
    app.get("/api/consultant/bookings", authenticateToken, async (req, res) => {
      const userId = req.user.userId;
      try {
        const pool = getDb();
        const connection = await pool.getConnection();
        try {
          // Verify if the user is a consultant
          const [userRows] = await connection.query(
            "SELECT isConsultant FROM users WHERE id = ?",
            [userId]
          );

          const user = userRows[0];

          if (!user || user.isConsultant !== 1) {
            return res
              .status(403)
              .json({ message: "User is not a consultant" });
          }

          // Get the consultant's bookings
          const [bookings] = await connection.query(
            "SELECT * FROM bookings WHERE consultantId = ?",
            [userId]
          );
          res.json(bookings);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to retrieve consultant bookings",
            error: error.message,
          });
      }
    });

    app.get(
      "/api/getDetails/:bookingId",
      authenticateToken,
      async (req, res) => {
        const { bookingId } = req.params;

        // Validate that bookingId is a valid integer
        if (isNaN(bookingId)) {
          return res.status(400).json({ error: "Invalid booking ID" });
        }

        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            const [userRows] = await connection.query(
              `SELECT u.id, u.fullName, u.email, u.password, u.role, u.isConsultant, u.phone,
             u.bloodGroup, u.medicalHistory, u.currentPrescriptions,
             u.areasOfExpertise, u.isApproved, u.profilePicture, u.speciality, u.availability, u.bankAccount, u.qualification, u.bio
           FROM users u
           JOIN bookings b ON u.id = b.userId
           WHERE b.id = ?;`,
              [bookingId]
            );

            const userDetails = userRows[0];

            if (!userDetails) {
              return res.status(404).json({ error: "Booking not found" });
            }
            // Fetch all health records related to the user
            const [healthRecords] = await connection.query(
              `SELECT hr.medicalHistory, hr.ongoingTreatments, hr.prescriptions
               FROM healthrecords hr
               WHERE hr.userId = ?;`,
              [userDetails.id]
            );
            // Return user details along with their health records
            res.json({
              user: userDetails,
              healthRecords: healthRecords || [], // Ensure an empty array if no records found
            });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to retrieve user details",
              error: error.message,
            });
        }
      }
    );

    // Consultant approval route for admin
    app.put(
      "/api/admin/consultants/:userId/approve",
      authenticateAdmin,
      async (req, res) => {
        const { userId } = req.params;

        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            const [updateResult] = await connection.query(
              "UPDATE users SET isApproved = 1 WHERE id = ?",
              [userId]
            );
            if (updateResult.affectedRows === 0) {
              return res.status(404).json({ message: "Consultant not found" });
            }
            res.json({ message: "Consultant approved successfully" });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to approve consultant",
              error: error.message,
            });
        }
      }
    );

    // Consultant decline route for admin
    app.put(
      "/api/admin/consultants/:userId/reject",
      authenticateAdmin,
      async (req, res) => {
        const { userId } = req.params;

        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            const [updateResult] = await connection.query(
              "UPDATE users SET isApproved = 2 WHERE id = ?",
              [userId]
            );
            if (updateResult.affectedRows === 0) {
              return res.status(404).json({ message: "Consultant not found" });
            }
            res.json({ message: "Consultant approved successfully" });
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to approve consultant",
              error: error.message,
            });
        }
      }
    );

    // Route to get all bookings for a specific consultant ID
    app.get(
      "/api/consultants/:consultantId/bookings",
      authenticateToken,
      async (req, res) => {
        const { consultantId } = req.params;
        const userId = req.user.userId;

        try {
          const pool = getDb();
          const connection = await pool.getConnection();
          try {
            // Verify if the requesting user is the consultant or admin
            const [consultantRows] = await connection.query(
              "SELECT isConsultant, id, isApproved FROM users WHERE id = ?",
              [consultantId]
            );
            const consultant = consultantRows[0];

            if (!consultant || consultant.isConsultant !== 1) {
              return res.status(404).json({
                message: "Consultant not found or is not a consultant",
              });
            }
            if (!consultant || consultant.isApproved !== 1) {
              return res.status(404).json({
                message:
                  "We are currently reviewing your profile as part of our standard security procedures.\n\n Rest assured, this is simply a routine check to ensure the integrity of our platform and maintain the trust of all our valued customers.\n\n Your account will be activated shortly after the review process is complete.\n\n Thank you for your patience and understanding.",
              });
            }

            //Check If consultant or Admin is requesting bookings
            const [userRows] = await connection.query(
              "SELECT role FROM users WHERE id = ?",
              [userId]
            );

            const user = userRows[0];

            if (!user) {
              return res.status(404).json({ message: "User not found" });
            }
            // Get all bookings for the consultant
            const [bookings] = await connection.query(
              "SELECT * FROM bookings WHERE consultantId = ?",
              [consultantId]
            );

            res.json(bookings);
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message: "Failed to retrieve consultant bookings",
              error: error.message,
            });
        }
      }
    );

    app.use(
      "/uploads",
      express.static(path.join(__dirname, "uploads"), {
        setHeaders: (res, path, stat) => {
          res.set("Access-Control-Allow-Origin", "*"); // Allow any origin
          res.set("Cross-Origin-Resource-Policy", "cross-origin"); // Allow cross-origin resource access
        },
      })
    );

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });
