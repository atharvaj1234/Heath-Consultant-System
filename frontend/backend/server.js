const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { initializeDatabase, getDb } = require('./database');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5555;

// Security Enhancements
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(helmet());
app.use(limiter);
app.use(morgan('dev'));

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173']; // Use an environment variable for production
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Initialize database
initializeDatabase()
  .then(() => {
    // Helper function to handle database errors
    const handleDatabaseError = (res, err, message) => {
      console.error(err.message);
      return res.status(500).json({ message: message || 'Database operation failed', error: err.message });
    };

    // Helper function to generate JWT token
    const generateToken = (user) => {
      return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: '1h' }); // Use environment variable for secret
    };

    // User Registration
    app.post('/api/register', [
      body('fullName').notEmpty().withMessage('Full name is required'),
      body('email').isEmail().withMessage('Invalid email address'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
      body('role').isIn(['user', 'consultant']).withMessage('Invalid role selected')
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fullName, email, password, role, bloodGroup, medicalHistory, currentPrescriptions, contactInformation, areasOfExpertise } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const db = getDb();

        let sql = "INSERT INTO users (fullName, email, password, role";
        let values = [fullName, email, hashedPassword, role];

        if (role === 'user') {
          sql += ", bloodGroup, medicalHistory, currentPrescriptions) VALUES (?, ?, ?, ?, ?, ?, ?)";
          values.push(bloodGroup, medicalHistory, currentPrescriptions);
        } else if (role === 'consultant') {
          sql += ", isConsultant, contactInformation, areasOfExpertise, isApproved) VALUES (?, ?, ?, ?, 1, ?, ?, 0)";
          values.push(contactInformation, areasOfExpertise);
        } else {
          sql += ") VALUES (?, ?, ?, ?)";
        }

        db.run(sql, values, function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ message: 'Email already exists' });
            }
            return handleDatabaseError(res, err, 'Registration failed due to database error');
          }

          const userId = this.lastID;
          res.status(201).json({ id: userId, fullName, email, role });
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Registration failed' });
      }
    });

    // User Login
    app.post('/api/login', [
      body('email').isEmail().withMessage('Invalid email address'),
      body('password').notEmpty().withMessage('Password is required')
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      try {
        const db = getDb();
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
          if (err) {
            return handleDatabaseError(res, err, 'Login failed due to database error');
          }

          if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
          }

          const token = generateToken(user);
          res.json({
            token,
            role: user.role,
            userId: user.id,
            isConsultant: user.isConsultant,
            isApproved: user.isApproved
          });
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
      }
    });

    // Authentication Middleware
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token', error: err.message });
        }
        req.user = user;
        next();
      });
    };

    // User Profile (GET)
    app.get('/api/profile', authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.get("SELECT id, fullName, email, role, isConsultant, bloodGroup, medicalHistory, currentPrescriptions, contactInformation, areasOfExpertise FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve profile');
        }

        if (!user) {
          return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(user);
      });
    });

    // User Profile (PUT)
    app.put('/api/profile', authenticateToken, [
      body('fullName').notEmpty().withMessage('Full name is required'),
      body('email').isEmail().withMessage('Invalid email address')
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { fullName, email } = req.body;
      const db = getDb();

      db.run("UPDATE users SET fullName = ?, email = ? WHERE id = ?", [fullName, email, userId], (err) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to update profile');
        }

        res.json({ id: userId, fullName, email });
      });
    });

    // Consultant Profile (GET)
    app.get('/api/consultant/profile', authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.get("SELECT * FROM consultants WHERE userId = ?", [userId], (err, consultant) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve consultant profile');
        }

        if (!consultant) {
          return res.status(404).json({ message: 'Consultant profile not found' });
        }

        res.json(consultant);
      });
    });

    // Consultant Profile (PUT)
    app.put('/api/consultant/profile', authenticateToken, [
      body('specialty').notEmpty().withMessage('Specialty is required'),
      body('specialty').isLength({ max: 50 }).withMessage('Specialty must be less than 50 characters'),
      body('qualifications').notEmpty().withMessage('Qualifications are required'),
      body('availability').notEmpty().withMessage('Availability is required')
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { specialty, qualifications, availability } = req.body;
      const db = getDb();

      db.run("UPDATE consultants SET specialty = ?, qualifications = ?, availability = ? WHERE userId = ?", [specialty, qualifications, availability, userId], (err) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to update consultant profile');
        }

        res.json({ userId, specialty, qualifications, availability });
      });
    });

    // List Consultants (GET)
    app.get('/api/consultants', (req, res) => {
      const { specialty, rating, availability } = req.query;
      let query = "SELECT * FROM consultants WHERE 1=1"; // Start with a base query

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
          return res.status(500).json({ message: 'Failed to retrieve consultants' });
        }
        res.json(consultants);
      });
    });

    // Get Consultant by ID (GET)
    app.get('/api/consultants/:id', (req, res) => {
      const consultantId = req.params.id;
      const db = getDb();

      db.get("SELECT * FROM consultants WHERE id = ?", [consultantId], (err, consultant) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve consultant');
        }

        if (!consultant) {
          return res.status(404).json({ message: 'Consultant not found' });
        }

        res.json(consultant);
      });
    });

    // Bookings (GET and POST)
    app.get('/api/bookings', authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all("SELECT * FROM bookings WHERE userId = ?", [userId], (err, bookings) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve bookings');
        }

        res.json(bookings);
      });
    });

    app.post('/api/bookings', authenticateToken, [
      body('consultantId').notEmpty().withMessage('Consultant ID is required'),
      body('date').notEmpty().withMessage('Date is required'),
      body('time').notEmpty().withMessage('Time is required')
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { consultantId, date, time, status = 'pending' } = req.body;
      const db = getDb();

      db.run("INSERT INTO bookings (userId, consultantId, date, time, status) VALUES (?, ?, ?, ?, ?)", [userId, consultantId, date, time, status], function (err) {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to create booking');
        }

        const bookingId = this.lastID;
        res.status(201).json({ id: bookingId, userId, consultantId, date, time, status });
      });
    });

    // Booking acceptance route
    app.put('/api/bookings/:id/accept', authenticateToken, (req, res) => {
      const bookingId = req.params.id;
      const db = getDb();

      db.run("UPDATE bookings SET status = 'accepted' WHERE id = ?", [bookingId], function (err) {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to accept booking');
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking accepted successfully' });
      });
    });

    // Health Records (GET and POST)
    app.get('/api/healthrecords', authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all("SELECT * FROM healthrecords WHERE userId = ?", [userId], (err, healthrecords) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve health records');
        }

        res.json(healthrecords);
      });
    });

    app.post('/api/healthrecords', authenticateToken, [
      body('medicalHistory').notEmpty().withMessage('Medical history is required'),
      body('ongoingTreatments').notEmpty().withMessage('Ongoing treatments are required'),
      body('prescriptions').notEmpty().withMessage('Prescriptions are required')
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { medicalHistory, ongoingTreatments, prescriptions } = req.body;
      const db = getDb();

      db.run("INSERT INTO healthrecords (userId, medicalHistory, ongoingTreatments, prescriptions) VALUES (?, ?, ?, ?)", [userId, medicalHistory, ongoingTreatments, prescriptions], function (err) {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to create health record');
        }

        const recordId = this.lastID;
        res.status(201).json({ id: recordId, userId, medicalHistory, ongoingTreatments, prescriptions });
      });
    });

    // Messages (GET and POST)
    app.get('/api/messages', authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all("SELECT * FROM messages WHERE userId = ?", [userId], (err, messages) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve messages');
        }

        res.json(messages);
      });
    });

    app.post('/api/messages', authenticateToken, [
      body('consultantId').notEmpty().withMessage('Consultant ID is required'),
      body('message').notEmpty().withMessage('Message text is required')
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { consultantId, message } = req.body;
      const timestamp = new Date().toISOString();
      const db = getDb();

      db.run("INSERT INTO messages (userId, consultantId, message, timestamp) VALUES (?, ?, ?, ?)", [userId, consultantId, message, timestamp], function (err) {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to create message');
        }

        const messageId = this.lastID;
        res.status(201).json({ id: messageId, userId, consultantId, message, timestamp });
      });
    });

    // Payments (GET)
    app.get('/api/payments', authenticateToken, (req, res) => {
      const userId = req.user.userId;
      const db = getDb();

      db.all("SELECT * FROM payments WHERE userId = ?", [userId], (err, payments) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve payments');
        }

        res.json(payments);
      });
    });

    // Reviews (POST)
    app.post('/api/reviews', authenticateToken, [
      body('consultantId').notEmpty().withMessage('Consultant ID is required'),
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
      body('review').notEmpty().withMessage('Review text is required')
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { consultantId, rating, review } = req.body;
      const db = getDb();

      db.run("INSERT INTO reviews (userId, consultantId, rating, review) VALUES (?, ?, ?, ?)", [userId, consultantId, rating, review], function (err) {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to create review');
        }

        const reviewId = this.lastID;
        res.status(201).json({ id: reviewId, userId, consultantId, rating, review });
      });
    });

    // Admin Authentication Middleware
    const authenticateAdmin = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token', error: err.message });
        }

        if (user.role !== 'admin') {
          return res.status(403).json({ message: 'Unauthorized: Admin access required' });
        }

        req.user = user;
        next();
      });
    };

    // Admin - Get All Users
    app.get('/api/admin/users', authenticateAdmin, (req, res) => {
      const db = getDb();

      db.all("SELECT id, fullName, email, role, isConsultant, bloodGroup, medicalHistory, currentPrescriptions, contactInformation, areasOfExpertise FROM users", [], (err, users) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve users');
        }

        res.json(users);
      });
    });

    // Admin - Get All Consultants
    app.get('/api/admin/consultants', authenticateAdmin, (req, res) => {
      const db = getDb();

      db.all("SELECT * FROM consultants", [], (err, consultants) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve consultants');
        }

        res.json(consultants);
      });
    });

    // Admin - Get All Bookings
    app.get('/api/admin/bookings', authenticateAdmin, (req, res) => {
      const db = getDb();

      db.all("SELECT * FROM bookings", [], (err, bookings) => {
        if (err) {
          return handleDatabaseError(res, err, 'Failed to retrieve bookings');
        }

        res.json(bookings);
      });
    });

    // Contact Form Submission (POST)
    app.post('/api/contact', [
      body('name').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Invalid email address'),
      body('subject').notEmpty().withMessage('Subject is required'),
      body('message').notEmpty().withMessage('Message is required')
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;
      const db = getDb();

      db.run("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)", [name, email, subject, message], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Failed to submit contact form' });
        }

        res.status(200).json({ message: 'Contact form submitted successfully' });
      });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });