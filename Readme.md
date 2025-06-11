# Health Consultant Platform - README

## Project Overview

The Health Consultant platform is a comprehensive online telehealth solution designed to connect patients with qualified healthcare professionals for remote consultations, personalized health advice, and ongoing care management. This platform aims to improve access to healthcare, enhance patient convenience, and reduce healthcare costs by leveraging technology to bridge the gap between patients and medical expertise.

## Key Features

*   **User Management:** Secure registration, login, and profile management for patients, consultants, and administrators.
*   **Consultant Profiles:** Detailed profiles showcasing qualifications, specialties, expertise, consultation fees, and availability.
*   **Advanced Search & Filtering:** Patients can refine the search and the number of consutants with a variety of filters."
*   **Appointment Scheduling & Management:** Efficient scheduling and management of appointments with calendar integration and automated reminders.
*   **Secure Payment Gateway:** Seamless integration with Stripe and PayPal for secure payment processing.
*   **Real-Time Chat & Messaging:** Secure text-based communication between patients and consultants.
*   **Health Record Management:** Secure storage and retrieval of patient medical histories, prescriptions, and other relevant documents.
*   **Administrative Dashboard:** Comprehensive tools for managing users, consultants, bookings, and system settings.
*    **Consultant approval Module:** A module for admin, to approve and decline newly registered consultant"

## Technologies Used

*   **Frontend:**
    *   React: JavaScript library for building user interfaces
    *   JavaScript: Core programming language
    *   JSX: Syntax extension for describing UI components
    *   CSS: Styling the frontend components
    *   Tailwind CSS: Utility-first CSS framework
    *    Lucide React: A react library for icons
    *   Material UI: UI framework, components like dialogs, selects
    *   Vite: Build tool
    *   Dayjs: For parsing, validating, manipulating, and displaying dates and times
*   **Backend:**
    *   Node.js: JavaScript runtime environment
    *   Express.js: Web application framework
    *   MySQL: Relational database management system
    *   Sequelize: ORM
    *   JSON Web Tokens (JWT): User authentication and authorization
    *   bcrypt: Password hashing
    *   cors: Cross-Origin Resource Sharing
    *   dotenv: Environment variables
    *   morgan: Logging
    *    helmet: Increase website security with HTTP headers
    *    Express-rate-limit: Rate limiting helps prevent DDOS
    *   Multer: File uploading
    *   Nodemailer: Sending emails

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/atharvaj1234/Heath-Consultant-System.git
    cd Heath-Consultant-System
    ```

2.  **Configure the backend:**

    *   Navigate to the `backend` directory.
    *   Create a `.env` file based on the `.env.example` file.
    *   Fill in the necessary environment variables, including database credentials, JWT secret, and payment gateway API keys.
    *   Install backend dependencies:

        ```bash
        npm install
        ```

    *   Start the backend server:

        ```bash
        node server.js
        ```

3.  **Configure the frontend:**

    *   Navigate to the `frontend` directory.
    *   Install frontend dependencies:

        ```bash
        npm install
        ```

    *   Start the frontend development server:

        ```bash
        npm run dev
        ```

4.  **Database Setup:**

    *   Ensure you have MySQL installed and running.
    *   Configure the database connection details.
    *   And then start the backend. The backend will automatically create the required tables and insert he dummy data for testing.

## Key API Endpoints

*   `/api/register`: User registration
*   `/api/login`: User login
*   `/api/profile`: User profile management
*   `/api/consultants`: Consultant search and retrieval
*   `/api/bookings`: Booking creation and management
*   `/api/healthrecords`: Health record management
*   `/api/messages`: Messaging
*   `/api/payments`: Payment processing
*   `/api/admin`: Administrative endpoints

## Contributing

Contributions to the Health Consultant platform are welcome! Please follow these guidelines:

*   Fork the repository.
*   Create a branch for your feature or bug fix.
*   Write clear, concise, and well-documented code.
*   Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License.
