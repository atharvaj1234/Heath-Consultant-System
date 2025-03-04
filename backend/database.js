const sqlite3 = require("sqlite3").verbose();

const dbName = "healthconsultant.db";
let db;

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbName, (err) => {
      if (err) {
        console.error("Database connection error:", err.message);
        reject(err);
      } else {
        console.log("Connected to the database.");
        resolve(db);
      }
    });
  });
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
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT,
      phone TEXT NOT NULL,
      profilePicture TEXT DEFAULT NULL, -- Path to the profile picture (optional)
      
      -- User-specific fields
      bloodGroup TEXT DEFAULT NULL,
      medicalHistory TEXT DEFAULT NULL,
      currentPrescriptions TEXT DEFAULT NULL,

      -- Consultant-specific fields
      isConsultant INTEGER DEFAULT 0, -- 1 if consultant, 0 otherwise
      bio TEXT DEFAULT NULL,
      qualification TEXT DEFAULT NULL,
      areasOfExpertise TEXT DEFAULT NULL,
      speciality TEXT DEFAULT NULL,
      availability TEXT DEFAULT NULL,  -- Store as JSON string
      bankAccount TEXT DEFAULT NULL,

      isApproved INTEGER DEFAULT 0 -- 1 if approved, 0 otherwise
    );
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS consultants (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          specialty TEXT,
          qualifications TEXT,
          availability TEXT,
          imageUrl TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          consultantId INTEGER,
          date TEXT,
          time TEXT,
          status TEXT,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (consultantId) REFERENCES consultants(id)
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS healthrecords (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          medicalHistory TEXT,
          ongoingTreatments TEXT,
          prescriptions TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          consultantId INTEGER,
          message TEXT,
          timestamp TEXT,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (consultantId) REFERENCES consultants(id)
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          consultantId INTEGER,
          rating INTEGER,
          review TEXT,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (consultantId) REFERENCES consultants(id)
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );
      db.run(
        `
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY,
          name TEXT,
          email TEXT,
          subject TEXT,
          message TEXT
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );
      db.run(`

        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bookingId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          amount REAL NOT NULL,
          paymentDate TEXT NOT NULL,
          paymentMethod TEXT,
          status TEXT NOT NULL, -- e.g., 'paid', 'refunded', 'pending'
          FOREIGN KEY (bookingId) REFERENCES bookings(id),
          FOREIGN KEY (userId) REFERENCES users(id)
        );
              `, (err) => {
                if (err) {
                  reject(err);
                  return;
                }
              });
      db.run(
        `
        CREATE TABLE IF NOT EXISTS refunds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          paymentId INTEGER NOT NULL,
          refundDate TEXT NOT NULL,
          refundAmount REAL NOT NULL,
          reason TEXT,
          FOREIGN KEY (paymentId) REFERENCES payments(id)
        );
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      resolve();
    });
  });
}

async function seedConsultants() {
  // Check if users table is empty
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) AS count FROM users WHERE isConsultant = 1",
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        const count = row.count;

        if (count === 0) {
          // If consultants table is empty, seed with dummy data
          const stmt = db.prepare(`
            INSERT INTO users (fullName, email, password, role, phone, isConsultant, bio, qualification, areasOfExpertise, speciality, availability, bankAccount, isApproved, profilePicture)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const consultants = [
            {
              fullName: "Dr. Jane Doe",
              email: "jane.doe@example.com",
              password: "password123",
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
            },
            {
              fullName: "Dr. John Smith",
              email: "john.smith@example.com",
              password: "password456",
              role: "consultant",
              phone: "555-987-6543",
              bio: "Neurologist specializing in migraines",
              qualification: "PhD, Neurology",
              areasOfExpertise: "Migraines, Epilepsy",
              speciality: "Neurology",
              availability:
                '{"Wednesday": "10:00-18:00", "Thursday": "10:00-18:00"}',
              bankAccount: "0987654321",
              isApproved: 0,
              profilePicture: "https://placehold.co/200x200",
            },
            {
              fullName: "Dr. Emily Chen",
              email: "emily.chen@example.com",
              password: "password789",
              role: "consultant",
              phone: "555-555-5555",
              bio: "Pediatrician with a passion for child health",
              qualification: "MD, Pediatrics",
              areasOfExpertise: "Childhood illnesses, Vaccinations",
              speciality: "Pediatrics",
              availability:
                '{"Friday": "8:00-16:00", "Saturday": "8:00-12:00"}',
              bankAccount: "1122334455",
              isApproved: 1,
              profilePicture: "https://placehold.co/200x200",
            },
          ];

          consultants.forEach((consultant) => {
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
            } = consultant;

            stmt.run(
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
              ],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }
              }
            );
          });

          stmt.finalize((err) => {
            if (err) {
              reject(err);
              return;
            }
            console.log("Consultants table seeded with dummy data.");
            resolve();
          });
        } else {
          console.log("Consultants table already has data, skipping seeding.");
          resolve();
        }
      }
    );
  });
}

module.exports = {
  initializeDatabase,
  getDb: () => db,
};
