# Placement Tracker - Setup & Configuration Guide

## 🔧 Configuration Changes Made

### Security Improvements

#### 1. **Environment Variables for Sensitive Data**

The application now uses environment variables for sensitive configuration. Create a `.env` file or set these environment variables:

```bash
# Required Environment Variables
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@gct.ac.in
BASE_URL=http://localhost:8080
```

#### 2. **Application Properties**

A template file `application.properties.example` has been created. To set up:

1. Copy the example file:
   ```bash
   cd Placement_Tracker/src/main/resources
   cp application.properties.example application.properties
   ```

2. Edit `application.properties` and replace the placeholder values with your actual credentials:
   ```properties
   spring.mail.username=${MAIL_USERNAME:your-email@gmail.com}
   spring.mail.password=${MAIL_PASSWORD:your-app-password}
   app.admin.email=${ADMIN_EMAIL:admin@gct.ac.in}
   ```

3. **Important**: Never commit `application.properties` to version control. It's now in `.gitignore`.

### Gmail Setup for Email Service

To enable email functionality:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App Passwords
   - Select "Mail" and your device
   - Copy the 16-character password
4. Use this password in `MAIL_PASSWORD` environment variable

### MongoDB Setup

Ensure MongoDB is running locally:

```bash
# Start MongoDB
mongod --dbpath /path/to/data/directory

# Or if using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

The application will automatically create the `placement_tracker_db` database.

## 🚀 Running the Application

### Backend (Spring Boot)

```bash
cd Placement_Tracker
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend (React)

```bash
cd placement-tracker-frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## 📋 API Documentation

Swagger UI is available at: `http://localhost:8080/swagger-ui.html`

## 🐛 Issues Fixed

### Backend Improvements:
1. ✅ **Security**: Moved hardcoded credentials to environment variables
2. ✅ **CORS Configuration**: Removed redundant `@CrossOrigin` annotations from controllers
3. ✅ **Logging**: Replaced `System.out.println` with SLF4J logger for production-ready logging
4. ✅ **File Protection**: Added `application.properties` to `.gitignore` and created template

### Frontend Improvements:
1. ✅ **Import Optimization**: Removed unnecessary `.js` extension from imports
2. ✅ **Error Handling**: Added ErrorBoundary component for graceful error handling
3. ✅ **Upload Directory**: Added `uploads/` folder to `.gitignore`

## 📊 Architecture Overview

### Backend Stack:
- **Framework**: Spring Boot 3.4.1
- **Java Version**: 21
- **Database**: MongoDB
- **Build Tool**: Maven
- **API Documentation**: Swagger/OpenAPI
- **Email**: Spring Mail with Gmail SMTP

### Frontend Stack:
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.21.1
- **HTTP Client**: Axios 1.6.2
- **UI**: Custom CSS with React Icons

### Application Features:
- Student registration with GCT email verification
- Mentor approval system with verification codes
- Admin dashboard for user management
- Interview experience sharing
- Department-wise and company-wise experience filtering
- File upload for resources
- Profile management

## 🔐 Security Features

1. **Password Encryption**: BCrypt password hashing
2. **Email Verification**: OTP-based email verification for students
3. **Mentor Verification**: Admin-approved mentor registration with verification codes
4. **CORS Protection**: Configured for specific origins
5. **File Upload Validation**: Only ZIP files allowed with size limits (10MB)

## 📧 Email Notifications

The system sends automated emails for:
- Student OTP verification
- Mentor registration approval requests to admin
- Mentor verification codes
- Mentor approval/rejection notifications

## 🗂️ Database Collections

- **users**: Student and mentor information
- **admins**: Admin accounts
- **departments**: Academic departments
- **companies**: Company information
- **interviewExperiences**: Interview experiences shared by mentors
- **placementExperiences**: Placement experiences

## 🛠️ Troubleshooting

### Email not sending:
- Verify Gmail app password is correct
- Check if 2FA is enabled on Google account
- Ensure `MAIL_USERNAME` and `MAIL_PASSWORD` are set

### MongoDB connection issues:
- Verify MongoDB is running: `mongosh`
- Check connection string in `application.properties`
- Ensure database port 27017 is accessible

### Frontend not connecting to backend:
- Verify backend is running on port 8080
- Check CORS configuration in `CorsConfig.java`
- Ensure proxy is configured in `vite.config.js`

## 📝 Environment Setup Checklist

- [ ] Java 21 installed
- [ ] Maven installed
- [ ] Node.js 18+ installed
- [ ] MongoDB installed and running
- [ ] Gmail app password generated
- [ ] Environment variables set
- [ ] `application.properties` configured
- [ ] Dependencies installed (`mvnw clean install` and `npm install`)

## 🤝 Contributing

When contributing:
1. Never commit `application.properties` with real credentials
2. Use the `.example` template for documentation
3. Follow the existing code structure
4. Write meaningful commit messages
5. Test both backend and frontend before submitting

## 📞 Support

For issues or questions, contact the admin at the email specified in your configuration.
