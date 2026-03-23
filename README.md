# CSR Management System

A comprehensive full-stack Corporate Social Responsibility (CSR) Web Application designed to manage CSR activities, volunteer assignments, and employee participation seamlessly. The platform enables organizations to efficiently track their social initiatives and employee engagement.

---

## 🚀 Key Features

### User Roles & Dashboards
The application utilizes Role-Based Access Control (RBAC) to provide customized experiences:
- **Administrator Dashboard**: Centralized control panel to create new CSR projects, schedule events, manage overall bookings, and assign volunteers to specific projects. Features interactive charts for system analytics.
- **Employee Portal**: A seamless interface for employees to browse upcoming CSR activities, book participation slots, view their activity history, and receive system notifications.
- **Volunteer Portal**: Dedicated tools for volunteers to oversee the employees assigned to them, track event attendance, and manage ongoing activity logs.

### Application Capabilities
- **Rich Analytics & Reporting**: Interactive data visualization (charts & graphs) for tracking CSR impact and employee engagement metrics.
- **Export Capabilities**: Ability to export reports and data to PDF and Excel formats.
- **Interactive Maps**: Geographic mapping of CSR event locations using Leaflet.
- **Modern UI/UX**: Built with a sleek glassmorphism design system, smooth staggered entrance animations, and full dark-mode consistency across all components.
- **Automated Email Notifications**: Built-in email service for booking confirmations and system alerts.

---

## 🛠️ Technology Stack

Our application is built using a modern, scalable architecture:

### Frontend (User Interface)
- **Framework**: Angular 20
- **Language**: TypeScript
- **Styling & UI**: 
  - SCSS with a custom Glassmorphism design system
  - Angular Material Components
  - Tailwind CSS (Utility classes)
- **Data Visualization & Mapping**:
  - Chart.js / ng2-charts / ngx-charts
  - D3.js
  - Leaflet (Interactive mapping)
- **Utilities**: 
  - RxJS for reactive programming
  - html2canvas & jsPDF for PDF generation
  - xlsx for Excel exports
  - Firebase integration

### Backend (REST API & Business Logic)
- **Framework**: Spring Boot 3.5.7 (Java 17)
- **Architecture**: RESTful Controller-Service-Repository pattern
- **Security & Validation**: Spring Security (JWT authentication) and Spring Boot Validation
- **Database Access & ORM**: Spring Data JPA / Hibernate
- **Utilities**:
  - Spring Boot Mail (for sending automated emails)
  - Lombok (for reducing boilerplate Java code)
- **Databases**: 
  - MySQL (Primary Production Database)
  - H2 Database (In-memory testing)

---

## 💻 Getting Started

Follow these steps to set up the project locally on your development machine.

### Prerequisites
- [Node.js and npm](https://nodejs.org/) (for the Angular frontend)
- [Java Development Kit (JDK) 17+](https://www.oracle.com/java/technologies/javase-downloads.html) (for the Spring Boot backend)
- [MySQL Server](https://dev.mysql.com/downloads/installer/)

### 1. Database Setup
Ensure your MySQL server is running. Create a schema for the CSR module if you haven't already. The application's backend will automatically create the necessary database tables (via Hibernate auto-ddl) and seed initial mock data (Admin, Employees, Volunteers, and Projects) upon startup.

### 2. Backend Setup (Spring Boot)
1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Open `src/main/resources/application.properties` and verify your MySQL database credentials (username, password, and URL).
3. Start the Spring Boot server using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend REST API will start on `http://localhost:8080/`.*

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
4. Open your web browser and navigate to `http://localhost:4200/` to view and interact with the application.

---

## 👥 Team Members

- **Prabhudatta Mishra**
- **Rohit Kumar Behera**
- **Aman Sahoo**
- **Ommprakash Prusty**
- **Javad Ali Khan**

---

## 🤝 Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change. Ensure you test your code frontend (`npm test`) and backend (`./mvnw test`) before submitting pull requests.
