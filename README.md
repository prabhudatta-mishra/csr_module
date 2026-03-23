# CSR Management System

A comprehensive full-stack Corporate Social Responsibility (CSR) Web Application designed to manage CSR activities, volunteer assignments, and employee participation seamlessly.

## 🚀 Features

- **Role-Based Access Control**: Secure authentication and dedicated dashboards for Admins, Employees, and Volunteers.
- **Admin Dashboard**: Effortlessly manage CSR projects, events, overall bookings, and volunteer assignments.
- **Employee Portal**: Employees can browse and book CSR activities, track their participation history, and stay updated with notifications.
- **Volunteer Management**: Volunteers can oversee their assigned employees, track attendance, and manage activity logs.
- **Modern UI/UX**: Features a sleek design with glassmorphism elements, staggered entrance animations, and full dark-mode consistency across the app.
- **Data Persistence**: Robust MySQL database integration for persistently storing user profiles, roles, projects, and bookings.

## 🛠️ Tech Stack

- **Frontend**: Angular, TypeScript, SCSS Structure
- **Backend**: Java, Spring Boot, Spring Security
- **Database**: MySQL

## 💻 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js and npm](https://nodejs.org/) (for the Angular frontend)
- [Java Development Kit (JDK) 17+](https://www.oracle.com/java/technologies/javase-downloads.html) (for the Spring Boot backend)
- [MySQL Server](https://dev.mysql.com/downloads/installer/)

### 1. Database Setup
Ensure your MySQL server is running. The application's backend will automatically create the necessary database tables and seed initial mock data (Admin, Employees, Volunteers, and Projects) upon startup based on its configuration.

### 2. Backend Setup (Spring Boot)
1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Verify the database credentials in `src/main/resources/application.properties` to ensure they match your local MySQL setup.
3. Start the Spring Boot server:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend server will start on `http://localhost:8080/`.*

### 3. Frontend Setup (Angular)
1. Open a **new** terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```
4. Open your web browser and navigate to `http://localhost:4200/` to view the application.

## 🤝 Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
