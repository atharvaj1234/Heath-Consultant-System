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

dotenv.config();

const app = express();
const port = process.env.PORT || 5555;

// Security Enhancements
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(helmet());
app.use(limiter);
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
  if (res && typeof res.status === 'function') {
    return res
      .status(500)
      .json({
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
  upload.single("profilePicture"),
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
      availability,  // Consultant specific
      bankAccount, // Consultant Specific
    } = req.body;

    const profilePicture = req.file ? req.file.path : null;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const db = getDb();

      const isConsultant = role === "consultant" ? 1 : 0; // Set isConsultant flag

      // Construct the SQL query dynamically
      let sql =
        "INSERT INTO users (fullName, email, password, role, phone, isConsultant, profilePicture";
      let values = [fullName, email, hashedPassword, role, phone, isConsultant, profilePicture];

      // Add fields based on role
      if (role === "user") {
        sql += ", bloodGroup, medicalHistory, currentPrescriptions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        values.push(bloodGroup, medicalHistory, currentPrescriptions);
      } else if (role === "consultant") {
        sql +=
          ", bio, qualification, areasOfExpertise, speciality, availability, bankAccount, isApproved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        values.push(
          bio,
          qualification,
          areasOfExpertise,
          speciality,
          availability,
          bankAccount,
          0
        ); // isApproved default 0
      } else {
        sql += ") VALUES (?, ?, ?, ?, ?, ?, ?)"; //role = admin
      }

      // Execute the SQL query
      db.run(sql, values, function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res
              .status(400)
              .json({ message: "Email already exists" });
          }
          return handleDatabaseError(
            req,
            res,
            err,
            "Registration failed due to database error"
          );
        }

        const userId = this.lastID;

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
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Registration failed" });
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
          const db = getDb();
          db.get(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, user) => {
              if (err) {
                return handleDatabaseError(
                  res,
                  err,
                  "Login failed due to database error"
                );
              }

              if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
              }

              const passwordMatch = await bcrypt.compare(
                password,
                user.password
              );
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
            }
          );
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Login failed" });
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

    // User Profile (GET)
    app.get("/api/profile", authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.get(
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
        [userId],
        (err, user) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to retrieve profile");
          }

          if (!user) {
            return res.status(404).json({ message: "Profile not found" });
          }

          res.json(user);
        }
      );
    });

    // User Profile (PUT)
    app.put(
      "/api/profile",
      upload.single("profilePicture"),
      authenticateToken,
      [
        body("fullName").notEmpty().withMessage("Full name is required"),
        body("email").isEmail().withMessage("Invalid email address"),
      ],
      (req, res) => {
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
        const db = getDb();

        let sql = "UPDATE users SET fullName = ?, email = ?";
        const values = [fullName, email];

        if (req.user.role === "user") {
          sql +=
            ", bloodGroup = ?, medicalHistory = ?, currentPrescriptions = ?";
          values.push(bloodGroup, medicalHistory, currentPrescriptions);
        } else if (req.user.role === "consultant") {
          sql += ", phone = ?, bio = ?, qualification = ?, areasOfExpertise = ?, speciality = ?, availability = ?, bankAccount = ?";
          values.push(phone, bio, qualification, areasOfExpertise, speciality, availability, bankAccount);
        }
        sql += ", profilePicture = ? WHERE id = ?";
        values.push(profilePicture, userId);
        db.run(sql, values, (err) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to update profile");
          }

          res.json({ id: userId, fullName, email, profilePicture });
        });
      }
    );

    // Consultant Profile (GET)
    app.get("/api/consultant/profile", authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();
      console.log("user: ", req.user);

      // First, check if the user is a consultant
      db.get(
        "SELECT * FROM users WHERE id = ? AND isConsultant = 1",
        [userId],
        (err, user) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to check user role");
          }

          if (!user) {
            return res
              .status(403)
              .json({ message: "User is not a consultant", user: user });
          }

          // If the user is a consultant, retrieve the consultant profile
          res.json(user);
        }
      );
    });

    // Consultant Profile (PUT)
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
      ],
      (req, res) => {
        const userId = req.user.userId;
        const { specialty, qualifications, availability } = req.body;
        const db = getDb();

        // Verify if the user is a consultant before updating the profile
        db.get(
          "SELECT isConsultant FROM users WHERE id = ?",
          [userId],
          (err, user) => {
            if (err) {
              return handleDatabaseError(res, err, "Failed to check user role");
            }

            if (!user || user.isConsultant !== 1) {
              return res
                .status(403)
                .json({ message: "User is not a consultant" });
            }

            // Update the consultant profile
            db.run(
              "UPDATE users SET specialty = ?, qualification = ?, availability = ? WHERE id = ?",
              [specialty, qualifications, availability, userId],
              (err) => {
                if (err) {
                  return handleDatabaseError(
                    res,
                    err,
                    "Failed to update consultant profile"
                  );
                }

                res.json({ userId, specialty, qualifications, availability });
              }
            );
          }
        );
      }
    );

    // List Consultants (GET)
    app.get("/api/consultants", (req, res) => {
      const { specialty, rating, availability } = req.query;
      let query = "SELECT * FROM users WHERE isConsultant = 1"; // Start with a base query

      const params = [];
      if (specialty) {
        query += " AND specialty LIKE ?";
        params.push(`%${specialty}%`);
      }
      if (availability) {
        query += " AND availability LIKE ?";
        params.push(`%${availability}%`);
      }

      const db = getDb();
      db.all(query, params, (err, consultants) => {
        if (err) {
          console.error(err.message);
          return res
            .status(500)
            .json({ message: "Failed to retrieve consultants" });
        }
        res.json(consultants);
      });
    });

    // Get Consultant by ID (GET)
    app.get("/api/consultants/:id", (req, res) => {
      const consultantId = req.params.id;
      const db = getDb();

      db.get(
        "SELECT * FROM users WHERE id = ? AND isConsultant = 1",
        [consultantId],
        (err, consultant) => {
          if (err) {
            return handleDatabaseError(
              res,
              err,
              "Failed to retrieve consultant"
            );
          }

          if (!consultant) {
            return res.status(404).json({ message: "Consultant not found" });
          }

          res.json(consultant);
        }
      );
    });

    // Bookings (GET and POST)
    app.get("/api/bookings", authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all(
        "SELECT * FROM bookings WHERE userId = ?",
        [userId],
        (err, bookings) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to retrieve bookings");
          }

          res.json(bookings);
        }
      );
    });

    app.post(
      "/api/bookings",
      authenticateToken,
      [
        body("consultantId")
          .notEmpty()
          .withMessage("Consultant ID is required"),
        body("date").notEmpty().withMessage("Date is required"),
        body("time").notEmpty().withMessage("Time is required"),
      ],
      (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { consultantId, date, time, status = "pending" } = req.body;
        const db = getDb();

        db.get(
          "SELECT COUNT(*) AS count FROM bookings WHERE consultantId = ? AND date = ? AND time = ?",
          [consultantId, date, time],
          (err, row) => {
            if (err) {
              return handleDatabaseError(
                res,
                err,
                "Failed to check consultant availability"
              );
            }

            if (row.count > 0) {
              return res
                .status(400)
                .json({
                  message:
                    "Consultant is already booked for this date and time.",
                });
            }

            db.get(
              "SELECT COUNT(*) AS count FROM bookings WHERE userId = ? AND date = ? AND time = ?",
              [userId, date, time],
              (err, row) => {
                if (err) {
                  return handleDatabaseError(
                    res,
                    err,
                    "Failed to check user availability"
                  );
                }

                if (row.count > 0) {
                  return res
                    .status(400)
                    .json({
                      message:
                        "You already have a booking for this date and time.",
                    });
                }

                db.run(
                  "INSERT INTO bookings (userId, consultantId, date, time, status) VALUES (?, ?, ?, ?, ?)",
                  [userId, consultantId, date, time, status],
                  function (err) {
                    if (err) {
                      return handleDatabaseError(
                        res,
                        err,
                        "Failed to create booking"
                      );
                    }

                    const bookingId = this.lastID;
                    res
                      .status(201)
                      .json({
                        id: bookingId,
                        userId,
                        consultantId,
                        date,
                        time,
                        status,
                      });
                  }
                );
              }
            );
          }
        );
      }
    );

    // Booking acceptance route
    app.put("/api/bookings/:id/accept", authenticateToken, (req, res) => {
      const bookingId = req.params.id;
      const db = getDb();

      db.get(
        "SELECT consultantId, date, time FROM bookings WHERE id = ?",
        [bookingId],
        (err, booking) => {
          if (err) {
            return handleDatabaseError(
              res,
              err,
              "Failed to retrieve booking details"
            );
          }

          if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
          }

          db.get(
            "SELECT COUNT(*) AS count FROM bookings WHERE consultantId = ? AND date = ? AND time = ? AND status = 'accepted'",
            [booking.consultantId, booking.date, booking.time],
            (err, row) => {
              if (err) {
                return handleDatabaseError(
                  res,
                  err,
                  "Failed to check for conflicting bookings"
                );
              }

              if (row.count > 0) {
                return res
                  .status(400)
                  .json({
                    message:
                      "This timeslot is already booked by another booking.",
                  });
              }

              db.run(
                "UPDATE bookings SET status = 'accepted' WHERE id = ?",
                [bookingId],
                function (err) {
                  if (err) {
                    return handleDatabaseError(
                      res,
                      err,
                      "Another booking is already accepted for same timeslot, please consider cancelling that first."
                    );
                  }
                  if (this.changes === 0) {
                    return res
                      .status(404)
                      .json({ message: "Booking not found" });
                  }
                  res.json({ message: "Booking accepted successfully" });
                }
              );
            }
          );
        }
      );
    });

    app.put("/api/bookings/:id/cancel", authenticateToken, (req, res) => {
      const bookingId = req.params.id;
      const db = getDb();

      db.get(
        "SELECT consultantId, date, time FROM bookings WHERE id = ?",
        [bookingId],
        (err, booking) => {
          if (err) {
            return handleDatabaseError(
              res,
              err,
              "Failed to retrieve booking details"
            );
          }

          if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
          }

          db.run(
            "UPDATE bookings SET status = 'canceled' WHERE id = ?",
            [bookingId],
            function (err) {
              if (err) {
                return handleDatabaseError(
                  res,
                  err,
                  "Failed to update booking"
                );
              }
              if (this.changes === 0) {
                return res.status(404).json({ message: "Booking not found" });
              }
              res.json({ message: "Booking accepted successfully" });
            }
          );
        }
      );
    });

    app.put("/api/bookings/:id/reject", authenticateToken, (req, res) => {
      const bookingId = req.params.id;
      const db = getDb();

      db.get(
        "SELECT consultantId, date, time FROM bookings WHERE id = ?",
        [bookingId],
        (err, booking) => {
          if (err) {
            return handleDatabaseError(
              res,
              err,
              "Failed to retrieve booking details"
            );
          }

          if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
          }

          db.get(
            "SELECT COUNT(*) AS count FROM bookings WHERE consultantId = ? AND date = ? AND time = ? AND status = 'accepted'",
            [booking.consultantId, booking.date, booking.time],
            (err, row) => {
              if (err) {
                return handleDatabaseError(
                  res,
                  err,
                  "Failed to check for conflicting bookings"
                );
              }

              if (row.count > 0) {
                return res
                  .status(400)
                  .json({
                    message:
                      "This timeslot is already booked by another booking.",
                  });
              }

              db.run(
                "UPDATE bookings SET status = 'rejected' WHERE id = ?",
                [bookingId],
                function (err) {
                  if (err) {
                    return handleDatabaseError(
                      res,
                      err,
                      "Failed to update booking"
                    );
                  }
                  if (this.changes === 0) {
                    return res
                      .status(404)
                      .json({ message: "Booking not found" });
                  }
                  res.json({ message: "Booking accepted successfully" });
                }
              );
            }
          );
        }
      );
    });

    // Health Records (GET and POST)
    app.get("/api/healthrecords", authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all(
        "SELECT * FROM healthrecords WHERE userId = ?",
        [userId],
        (err, healthrecords) => {
          if (err) {
            return handleDatabaseError(
              res,
              err,
              "Failed to retrieve health records"
            );
          }

          res.json(healthrecords);
        }
      );
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
      (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { medicalHistory, ongoingTreatments, prescriptions } = req.body;
        const db = getDb();

        db.run(
          "INSERT INTO healthrecords (userId, medicalHistory, ongoingTreatments, prescriptions) VALUES (?, ?, ?, ?)",
          [userId, medicalHistory, ongoingTreatments, prescriptions],
          function (err) {
            if (err) {
              return handleDatabaseError(
                res,
                err,
                "Failed to create health record"
              );
            }

            const recordId = this.lastID;
            res
              .status(201)
              .json({
                id: recordId,
                userId,
                medicalHistory,
                ongoingTreatments,
                prescriptions,
              });
          }
        );
      }
    );

    // Messages (GET and POST)
    app.get("/api/messages", authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all(
        "SELECT * FROM messages WHERE userId = ?",
        [userId],
        (err, messages) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to retrieve messages");
          }

          res.json(messages);
        }
      );
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
      (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { consultantId, message } = req.body;
        const timestamp = new Date().toISOString();
        const db = getDb();

        db.run(
          "INSERT INTO messages (userId, consultantId, message, timestamp) VALUES (?, ?, ?, ?)",
          [userId, consultantId, message, timestamp],
          function (err) {
            if (err) {
              return handleDatabaseError(res, err, "Failed to create message");
            }

            const messageId = this.lastID;
            res
              .status(201)
              .json({
                id: messageId,
                userId,
                consultantId,
                message,
                timestamp,
              });
          }
        );
      }
    );

    // Payments (GET)
    app.get("/api/payments", authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all(
        "SELECT * FROM payments WHERE userId = ?",
        [userId],
        (err, payments) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to retrieve payments");
          }

          res.json(payments);
        }
      );
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
      (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const { consultantId, rating, review } = req.body;
        const db = getDb();

        db.run(
          "INSERT INTO reviews (userId, consultantId, rating, review) VALUES (?, ?, ?, ?)",
          [userId, consultantId, rating, review],
          function (err) {
            if (err) {
              return handleDatabaseError(res, err, "Failed to create review");
            }

            const reviewId = this.lastID;
            res
              .status(201)
              .json({ id: reviewId, userId, consultantId, rating, review });
          }
        );
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
    app.get("/api/admin/users", authenticateAdmin, (req, res) => {
      const db = getDb();

      db.all(
        "SELECT id, fullName, email, role, isConsultant, bloodGroup, medicalHistory, currentPrescriptions, phone, areasOfExpertise, isApproved, profilePicture FROM users",
        [],
        (err, users) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to retrieve users");
          }

          res.json(users);
        }
      );
    });

    // Admin - Get All Consultants
    app.get("/api/admin/consultants", authenticateAdmin, (req, res) => {
      const db = getDb();

      db.all("SELECT * FROM users WHERE isConsultant = 1", [], (err, consultants) => {
        if (err) {
          return handleDatabaseError(
            res,
            err,
            "Failed to retrieve consultants"
          );
        }

        res.json(consultants);
      });
    });

    // Admin - Get All Bookings
    app.get("/api/admin/bookings", authenticateAdmin, (req, res) => {
      const db = getDb();

      db.all("SELECT * FROM bookings", [], (err, bookings) => {
        if (err) {
          return handleDatabaseError(res, err, "Failed to retrieve bookings");
        }

        res.json(bookings);
      });
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
      (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, subject, message } = req.body;
        const db = getDb();

        db.run(
          "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
          [name, email, subject, message],
          function (err) {
            if (err) {
              console.error(err.message);
              return res
                .status(500)
                .json({ message: "Failed to submit contact form" });
            }

            res
              .status(200)
              .json({ message: "Contact form submitted successfully" });
          }
        );
      }
    );

    // Consultant Bookings Route
    app.get("/api/consultant/bookings", authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      // Verify if the user is a consultant
      db.get(
        "SELECT isConsultant FROM users WHERE id = ?",
        [userId],
        (err, user) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to check user role");
          }

          if (!user || user.isConsultant !== 1) {
            return res
              .status(403)
              .json({ message: "User is not a consultant" });
          }

          // Get the consultant's bookings
          db.all(
            "SELECT * FROM bookings WHERE consultantId = ?",
            [userId],
            (err, bookings) => {
              if (err) {
                return handleDatabaseError(
                  res,
                  err,
                  "Failed to retrieve consultant bookings"
                );
              }
              res.json(bookings);
            }
          );
        }
      );
    });

    app.get("/api/getDetails/:bookingId", authenticateToken, (req, res) => {
      const { bookingId } = req.params;

      // Validate that bookingId is a valid integer
      if (isNaN(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }

      const db = getDb();

      db.get(
        `SELECT u.id, u.fullName, u.email, u.password, u.role, u.isConsultant, u.phone,
           u.bloodGroup, u.medicalHistory, u.currentPrescriptions,
           u.areasOfExpertise, u.isApproved, u.profilePicture, u.speciality, u.availability, u.bankAccount, u.qualification, u.bio
         FROM users u
         JOIN bookings b ON u.id = b.userId
         WHERE b.id = ?;`,
        [bookingId],
        (err, userDetails) => {
          if (err) {
            return handleDatabaseError(res, err, "Failed to retrieve user details");
          }

          if (!userDetails) {
            return res.status(404).json({ error: "Booking not found" });
          }

          // Fetch all health records related to the user
          db.all(
            `SELECT hr.medicalHistory, hr.ongoingTreatments, hr.prescriptions
             FROM healthrecords hr
             WHERE hr.userId = ?;`,
            [userDetails.id],
            (err, healthRecords) => {
              if (err) {
                return handleDatabaseError(res, err, "Failed to retrieve health records");
              }

              // Return user details along with their health records
              res.json({
                user: userDetails,
                healthRecords: healthRecords || [], // Ensure an empty array if no records found
              });
            }
          );
        }
      );
    });



    // Consultant approval route for admin
    app.put(
      "/api/admin/consultants/:userId/approve",
      authenticateAdmin,
      (req, res) => {
        const { userId } = req.params;
        const db = getDb();

        db.run(
          "UPDATE users SET isApproved = 1 WHERE id = ?",
          [userId],
          function (err) {
            if (err) {
              return handleDatabaseError(
                res,
                err,
                "Failed to approve consultant"
              );
            }
            if (this.changes === 0) {
              return res.status(404).json({ message: "Consultant not found" });
            }
            res.json({ message: "Consultant approved successfully" });
          }
        );
      }
    );

    // Route to get all bookings for a specific consultant ID
    app.get(
      "/api/consultants/:consultantId/bookings",
      authenticateToken,
      (req, res) => {
        const { consultantId } = req.params;
        const userId = req.user.userId;
        const db = getDb();

        // Verify if the requesting user is the consultant or admin
        db.get(
          "SELECT isConsultant, id FROM users WHERE id = ?",
          [consultantId],
          (err, consultant) => {
            if (err) {
              return handleDatabaseError(
                res,
                err,
                "Failed to check consultant"
              );
            }

            if (!consultant || consultant.isConsultant !== 1) {
              return res.status(404).json({ message: "Consultant not found or is not a consultant" });
            }

            //Check If consultant or Admin is requesting bookings
            db.get(
              "SELECT role FROM users WHERE id = ?",
              [userId],
              (err, user) => {
                if (err) {
                  return handleDatabaseError(
                    res,
                    err,
                    "Failed to check user role"
                  );
                }

                if (!user) {
                  return res.status(404).json({ message: "User not found" });
                }

                // Get all bookings for the consultant
                db.all(
                  "SELECT * FROM bookings WHERE consultantId = ?",
                  [consultantId],
                  (err, bookings) => {
                    if (err) {
                      return handleDatabaseError(
                        res,
                        err,
                        "Failed to retrieve bookings"
                      );
                    }
                    res.json(bookings);
                  }
                );
              }
            );
          }
        );
      }
    );

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });