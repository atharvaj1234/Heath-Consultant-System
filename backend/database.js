const sqlite3 = require('sqlite3').verbose();

const dbName = 'healthconsultant.db';
let db;

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbName, (err) => {
      if (err) {
        console.error("Database connection error:", err.message);
        reject(err);
      } else {
        console.log('Connected to the database.');
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
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    throw error;
  }
}

async function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          fullName TEXT,
          email TEXT UNIQUE,
          password TEXT,
          role TEXT DEFAULT 'user',
          isConsultant TEXT,
          contactInformation TEXT,
          areasOfExpertise TEXT,
          isApproved TEXT,
          bloodGroup TEXT,
          medicalHistory TEXT,
          currentPrescriptions TEXT
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS consultants (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          specialty TEXT,
          qualifications TEXT,
          availability TEXT,
          imageUrl TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      db.run(`
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
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS healthrecords (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          medicalHistory TEXT,
          ongoingTreatments TEXT,
          prescriptions TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          consultantId INTEGER,
          message TEXT,
          timestamp TEXT,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (consultantId) REFERENCES consultants(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          amount REAL,
          date TEXT,
          status TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY,
          userId INTEGER,
          consultantId INTEGER,
          rating INTEGER,
          review TEXT,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (consultantId) REFERENCES consultants(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });
        db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY,
          name TEXT,
          email TEXT,
          subject TEXT,
          message TEXT
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      resolve();
    });
  });
}

async function seedConsultants() {
  return new Promise((resolve, reject) => {
    // Check if consultants table is empty
    db.get("SELECT COUNT(*) AS count FROM consultants", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      const count = row.count;

      if (count === 0) {
        // If consultants table is empty, seed with dummy data
        const stmt = db.prepare(`
          INSERT INTO consultants (userId, specialty, qualifications, availability, imageUrl)
          VALUES (?, ?, ?, ?, ?)
        `);

        const consultants = [
          { userId: 1, specialty: 'Cardiology', qualifications: 'MD', availability: 'Mon-Fri', imageUrl: 'https://placehold.co/200x200' },
          { userId: 2, specialty: 'Neurology', qualifications: 'PhD', availability: 'Tue-Sat', imageUrl: 'https://placehold.co/200x200' },
          { userId: 3, specialty: 'Pediatrics', qualifications: 'MD', availability: 'Wed-Sun', imageUrl: 'https://placehold.co/200x200' }
        ];

        consultants.forEach(consultant => {
          stmt.run([consultant.userId, consultant.specialty, consultant.qualifications, consultant.availability, consultant.imageUrl], (err) => {
            if (err) {
              reject(err);
              return;
            }
          });
        });

        stmt.finalize((err) => {
          if (err) {
            reject(err);
            return;
          }
          console.log('Consultants table seeded with dummy data.');
          resolve();
        });
      } else {
        console.log('Consultants table already has data, skipping seeding.');
        resolve();
      }
    });
  });
}


module.exports = {
  initializeDatabase,
  getDb: () => db,
};