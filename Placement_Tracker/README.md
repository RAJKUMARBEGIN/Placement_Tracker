# Placement Tracker - Backend Application

## Project Overview
Placement Tracker is a platform designed for college students to learn from the interview experiences of placed seniors. The application allows placed candidates to share detailed information about:
- Interview questions and problems
- Number of rounds and their descriptions
- In-person interview management tips
- Cracking strategies
- Preparation details and resources
- Optional mentoring contact information

## Features
✅ Department-wise organization
✅ Complete interview experience sharing
✅ Search by company, year, and department
✅ Optional mentor contact details
✅ RESTful API with full CRUD operations
✅ MySQL database integration
✅ Swagger/OpenAPI documentation
✅ Input validation
✅ Global exception handling

## Technology Stack
- **Framework**: Spring Boot 4.0.1
- **Database**: MySQL
- **ORM**: Spring Data JPA (Hibernate)
- **Documentation**: Swagger/OpenAPI 3.0
- **Build Tool**: Maven
- **Java Version**: 17

## Prerequisites
- JDK 17 or higher
- MySQL Server (8.0 or higher recommended)
- Maven 3.6+

## Database Setup

1. Install and start MySQL Server

2. The application will automatically create the database `placement_tracker_db` on first run

3. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Running the Application

### Option 1: Using Maven
```bash
mvnw clean install
mvnw spring-boot:run
```

### Option 2: Using IDE
Run the `PlacementTrackerApplication.java` main class

## API Documentation

Once the application is running, access Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON documentation:
```
http://localhost:8080/api-docs
```

## API Endpoints

### Department Management
- `POST /api/departments` - Create a new department
- `GET /api/departments` - Get all departments
- `GET /api/departments/{id}` - Get department by ID
- `PUT /api/departments/{id}` - Update department
- `DELETE /api/departments/{id}` - Delete department

### Interview Experience Management
- `POST /api/experiences` - Share interview experience
- `GET /api/experiences` - Get all experiences
- `GET /api/experiences/{id}` - Get experience by ID
- `GET /api/experiences/department/{departmentId}` - Get experiences by department
- `GET /api/experiences/search/company?companyName={name}` - Search by company
- `GET /api/experiences/year/{year}` - Get experiences by year
- `GET /api/experiences/mentors` - Get available mentors
- `GET /api/experiences/department/{departmentId}/year/{year}` - Filter by department and year
- `PUT /api/experiences/{id}` - Update experience
- `DELETE /api/experiences/{id}` - Delete experience

## Sample API Requests

### Create Department
```json
POST /api/departments
{
  "departmentName": "Computer Science Engineering",
  "description": "CSE department focusing on software development"
}
```

### Share Interview Experience
```json
POST /api/experiences
{
  "studentName": "John Doe",
  "companyName": "Google",
  "position": "Software Engineer",
  "yearOfPlacement": 2025,
  "departmentId": 1,
  "totalRounds": 4,
  "roundsDescription": "Round 1: Online Coding Test, Round 2: Technical Interview (DSA), Round 3: System Design, Round 4: HR Interview",
  "questionsAsked": "Arrays, Trees, Dynamic Programming, System Design for YouTube-like platform",
  "problemsSolved": "Two Sum, Binary Tree Level Order Traversal, Longest Palindromic Substring",
  "inPersonInterviewTips": "Be confident, explain your thought process, ask clarifying questions",
  "crackingStrategy": "Practiced 300+ problems on LeetCode, focused on medium-hard problems, did mock interviews",
  "preparationDetails": "Started 6 months before placements, dedicated 3-4 hours daily",
  "resources": "LeetCode, GeeksforGeeks, System Design Primer GitHub, Cracking the Coding Interview book",
  "willingToMentor": true,
  "contactEmail": "john.doe@example.com",
  "linkedinProfile": "https://linkedin.com/in/johndoe"
}
```

## Database Schema

### departments
- id (PK)
- department_name (UNIQUE)
- description

### interview_experiences
- id (PK)
- student_name
- company_name
- position
- year_of_placement
- department_id (FK)
- total_rounds
- rounds_description
- questions_asked
- problems_solved
- in_person_interview_tips
- cracking_strategy
- preparation_details
- resources
- willing_to_mentor
- contact_email
- contact_phone
- linkedin_profile
- submitted_at

## Project Structure
```
src/main/java/com/quizapplication/placement_tracker/
├── PlacementTrackerApplication.java
├── config/
│   └── OpenAPIConfig.java
├── controller/
│   ├── DepartmentController.java
│   └── InterviewExperienceController.java
├── dto/
│   ├── DepartmentDTO.java
│   └── InterviewExperienceDTO.java
├── entity/
│   ├── Department.java
│   └── InterviewExperience.java
├── exception/
│   ├── ErrorResponse.java
│   ├── GlobalExceptionHandler.java
│   ├── ResourceAlreadyExistsException.java
│   └── ResourceNotFoundException.java
├── repository/
│   ├── DepartmentRepository.java
│   └── InterviewExperienceRepository.java
└── service/
    ├── DepartmentService.java
    └── InterviewExperienceService.java
```

## Features Explained

### Department Management
Students can filter experiences by department (CSE, ECE, Mechanical, etc.)

### Comprehensive Experience Sharing
- Company and position details
- Round-by-round breakdown
- Specific questions and problems
- Preparation timeline and resources
- Success strategies

### Optional Mentoring
- Seniors can opt-in to mentoring
- Contact information only shown for willing mentors
- Respects privacy of those who don't want to be contacted

### Advanced Search & Filter
- Search by company name
- Filter by department
- Filter by year
- Find available mentors
- Combined filters (department + year)

## Error Handling
The application includes comprehensive error handling:
- 400 Bad Request - Validation errors
- 404 Not Found - Resource not found
- 409 Conflict - Duplicate resources
- 500 Internal Server Error - Unexpected errors

## Contributing
This is a college project. For suggestions or improvements, contact the development team.

## License
MIT License

## Support
For issues or questions, please contact: support@placementtracker.com

