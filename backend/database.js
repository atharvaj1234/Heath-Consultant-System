const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const dbName = 'healthconsultant'; // Your database name

let pool; // Use a connection pool for efficiency

async function connectToDatabase() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',  // Replace with your MySQL host
            user: process.env.DB_USER || 'root',       // Replace with your MySQL user
            password: process.env.DB_PASSWORD || '',   // Replace with your MySQL password,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test the connection and create the database if it doesn't exist
        const connection = await pool.getConnection();
        try {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            console.log(`Database "${dbName}" created (if it didn't exist).`);
        } finally {
            connection.release();
        }

        // Now, switch the connection pool to use the created database
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',  // Replace with your MySQL host
            user: process.env.DB_USER || 'root',       // Replace with your MySQL user
            password: process.env.DB_PASSWORD || '',   // Replace with your MySQL password
            database: process.env.DB_NAME || dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const newConnection = await pool.getConnection();
        console.log('Connected to the database.');
        newConnection.release(); // Release the connection back to the pool
        return pool;

    } catch (error) {
        console.error('Database connection error:', error.message);
        throw error;
    }
}

async function initializeDatabase() {
    try {
        await connectToDatabase();
        await createTables();
        await seedConsultants();
        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Database initialization failed:", error.message);
        throw error;
    }
}


async function createTables() {
  try {
      const connection = await pool.getConnection();

      // Users Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              fullName VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              role VARCHAR(50),
              phone VARCHAR(20) NOT NULL,
              profilePicture VARCHAR(255) DEFAULT NULL,
              bloodGroup VARCHAR(10) DEFAULT NULL,
              medicalHistory TEXT DEFAULT NULL,
              currentPrescriptions TEXT DEFAULT NULL,
              isConsultant TINYINT DEFAULT 0,
              bio TEXT DEFAULT NULL,
              qualification VARCHAR(255) DEFAULT NULL,
              areasOfExpertise TEXT DEFAULT NULL,
              speciality VARCHAR(255) DEFAULT NULL,
              availability TEXT DEFAULT NULL,
              bankAccount VARCHAR(255) DEFAULT NULL,
              consultingFees DECIMAL(10, 2) DEFAULT NULL,
              certificates TEXT DEFAULT NULL,
              isApproved TINYINT DEFAULT 0
          );
      `);

      // Consultants Table (Consider removing - fields are now in users)
      await connection.query(`
          CREATE TABLE IF NOT EXISTS consultants (
              id INT PRIMARY KEY AUTO_INCREMENT,
              userId INT,
              specialty VARCHAR(255),
              qualifications TEXT,
              availability TEXT,
              imageUrl VARCHAR(255),
              FOREIGN KEY (userId) REFERENCES users(id)
          );
      `);

      // Bookings Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS bookings (
              id INT PRIMARY KEY AUTO_INCREMENT,
              userId INT,
              consultantId INT,
              date DATE,
              time TIME,
              status VARCHAR(50),
              FOREIGN KEY (userId) REFERENCES users(id),
              FOREIGN KEY (consultantId) REFERENCES users(id)
          );
      `);

      // Health Records Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS healthrecords (
              id INT PRIMARY KEY AUTO_INCREMENT,
              userId INT,
              medicalHistory TEXT,
              ongoingTreatments TEXT,
              prescriptions TEXT,
              FOREIGN KEY (userId) REFERENCES users(id)
          );
      `);

      // Messages Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS messages (
              id INT PRIMARY KEY AUTO_INCREMENT,
              userId INT,
              consultantId INT,
              message TEXT,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (userId) REFERENCES users(id),
              FOREIGN KEY (consultantId) REFERENCES users(id)
          );
      `);

      // Chat Requests Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS chat_requests (
              id INT PRIMARY KEY AUTO_INCREMENT,
              userId INT NOT NULL,
              consultantId INT NOT NULL,
              bookingId INT NOT NULL,
              status VARCHAR(20) DEFAULT 'pending',
              FOREIGN KEY (userId) REFERENCES users(id),
              FOREIGN KEY (consultantId) REFERENCES users(id),
              FOREIGN KEY (bookingId) REFERENCES bookings(id),
              UNIQUE (userId, consultantId, bookingId)
          );
      `);

      // Chats Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS chats (
              id INT PRIMARY KEY AUTO_INCREMENT,
              chatRequestId INT NOT NULL,
              senderId INT NOT NULL,
              message TEXT NOT NULL,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (chatRequestId) REFERENCES chat_requests(id),
              FOREIGN KEY (senderId) REFERENCES users(id)
          );
      `);

      // Reviews Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS reviews (
              id INT PRIMARY KEY AUTO_INCREMENT,
              userId INT,
              consultantId INT,
              rating INT,
              review TEXT,
              bookingId INT,
              FOREIGN KEY (userId) REFERENCES users(id),
              FOREIGN KEY (consultantId) REFERENCES users(id),
              FOREIGN KEY (bookingId) REFERENCES bookings(id)
          );
      `);

      // Contacts Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS contacts (
              id INT PRIMARY KEY AUTO_INCREMENT,
              name VARCHAR(255),
              email VARCHAR(255),
              subject VARCHAR(255),
              message TEXT
          );
      `);

      // Payments Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS payments (
              id INT PRIMARY KEY AUTO_INCREMENT,
              bookingId INT NOT NULL,
              userId INT NOT NULL,
              amount DECIMAL(10, 2) NOT NULL,
              paymentDate DATETIME NOT NULL,
              paymentMethod VARCHAR(255),
              status VARCHAR(50) NOT NULL,
              FOREIGN KEY (bookingId) REFERENCES bookings(id),
              FOREIGN KEY (userId) REFERENCES users(id)
          );
      `);

      // Refunds Table
      await connection.query(`
          CREATE TABLE IF NOT EXISTS refunds (
              id INT PRIMARY KEY AUTO_INCREMENT,
              paymentId INT NOT NULL,
              refundDate DATETIME NOT NULL,
              refundAmount DECIMAL(10, 2) NOT NULL,
              reason TEXT,
              FOREIGN KEY (paymentId) REFERENCES payments(id)
          );
      `);

      connection.release();
      console.log('Tables created successfully.');

  } catch (error) {
      console.error('Error creating tables:', error.message);
      throw error;
  }
}

async function seedConsultants() {
    try {
        const connection = await pool.getConnection();

        // Check if users table is empty
        const [rows] = await connection.query("SELECT COUNT(*) AS count FROM users WHERE isConsultant = 1");
        const count = rows[0].count;

        if (count === 0) {
            const consultants = [
                {
                    fullName: "Dr. Jane Doe",
                    email: "jane.doe@example.com",
                    password: "$2b$10$O3jfFgJVuZ028Z2u.GCrk.SSpvbdzVUFc4sjI78Jzgsd.3qhyOlo.",
                    role: "consultant",
                    phone: "555-123-4567",
                    bio: "Experienced cardiologist",
                    qualification: "MD, Cardiology",
                    areasOfExpertise: "Heart failure, Hypertension",
                    speciality: "Cardiology",
                    availability: '{"Monday": "9:00-17:00", "Tuesday": "9:00-17:00"}',
                    bankAccount: "1234567890",
                    isApproved: 1,
                    profilePicture: "https://placehold.co/200x200",
                    consultingFees: 150.00,
                },
                {
                    fullName: "Dr. John Smith",
                    email: "john.smith@example.com",
                    password: "$2b$10$O3jfFgJVuZ028Z2u.GCrk.SSpvbdzVUFc4sjI78Jzgsd.3qhyOlo.",
                    role: "consultant",
                    phone: "555-987-6543",
                    bio: "Neurologist specializing in migraines",
                    qualification: "PhD, Neurology",
                    areasOfExpertise: "Migraines, Epilepsy",
                    speciality: "Neurology",
                    availability: '{"Wednesday": "10:00-18:00", "Thursday": "10:00-18:00"}',
                    bankAccount: "0987654321",
                    isApproved: 0,
                    profilePicture: "https://placehold.co/200x200",
                    consultingFees: 200.00,
                },
                {
                    fullName: "Dr. Emily Chen",
                    email: "emily.chen@example.com",
                    password: "$2b$10$O3jfFgJVuZ028Z2u.GCrk.SSpvbdzVUFc4sjI78Jzgsd.3qhyOlo.",
                    role: "consultant",
                    phone: "555-555-5555",
                    bio: "Pediatrician with a passion for child health",
                    qualification: "MD, Pediatrics",
                    areasOfExpertise: "Childhood illnesses, Vaccinations",
                    speciality: "Pediatrics",
                    availability: '{"Friday": "8:00-16:00", "Saturday": "8:00-12:00"}',
                    bankAccount: "1122334455",
                    isApproved: 1,
                    profilePicture: "https://placehold.co/200x200",
                    consultingFees: 120.00,
                },
                {
                  fullName: "Admin",
                  email: "admin@example.com",
                  password: "$2b$10$O3jfFgJVuZ028Z2u.GCrk.SSpvbdzVUFc4sjI78Jzgsd.3qhyOlo.",
                  role: "admin",
                  phone: "9999999999",
                  bio: "Admin Here",
                  qualification: "Admin, Health Consultant",
                  areasOfExpertise: "Management",
                  speciality: "Management",
                  availability: '{"Friday": "8:00-16:00", "Saturday": "8:00-12:00"}',
                  bankAccount: "0000000000",
                  isApproved: 1,
                  profilePicture: "https://placehold.co/200x200",
                  consultingFees: 120.00,
              },
            ];

            for (const consultant of consultants) {
                const {
                    fullName,
                    email,
                    password,
                    role,
                    phone,
                    bio,
                    qualification,
                    areasOfExpertise,
                    speciality,
                    availability,
                    bankAccount,
                    isApproved,
                    profilePicture,
                    consultingFees,
                } = consultant;

                await connection.query(
                    `
                    INSERT INTO users (fullName, email, password, role, phone, isConsultant, bio, qualification, areasOfExpertise, speciality, availability, bankAccount, isApproved, profilePicture, consultingFees)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        fullName,
                        email,
                        password,
                        role,
                        phone,
                        1, // isConsultant = 1
                        bio,
                        qualification,
                        areasOfExpertise,
                        speciality,
                        availability,
                        bankAccount,
                        isApproved,
                        profilePicture,
                        consultingFees,
                    ]
                );
            }

            // Add the reviews table data at the end of seedConsultants()
            await connection.query(`
              INSERT INTO reviews (userId, consultantId, rating, review, bookingId) VALUES
                (4, 6, 5, 'Excellent consultation! Highly recommended.', 1),
                (4, 7, 4, 'Very helpful and informative session.', 2),
                (4, 6, 3, 'Good but could be better.', 3);
            `);

            console.log("Consultants table seeded with dummy data.");
        } else {
            console.log("Consultants table already has data, skipping seeding.");
        }
        connection.release();

    } catch (error) {
        console.error('Error seeding consultants:', error.message);
    }
}

module.exports = {
    initializeDatabase,
    getDb: () => pool,  // Return the connection pool
};