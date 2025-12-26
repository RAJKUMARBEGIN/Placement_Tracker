# Swagger API Documentation - Working Solution

## What Was Fixed

The Swagger 500 error was caused by a **circular reference** between the `Department` and `InterviewExperience` entities. When Swagger tried to generate the API documentation, it got stuck in an infinite loop trying to serialize the bidirectional relationship.

### Solution Applied:
Added `@JsonIgnore` annotations to break the circular reference:
- In `Department.java` - Added `@JsonIgnore` to the `interviewExperiences` list
- In `InterviewExperience.java` - Added `@JsonIgnore` to the `department` field

This prevents Jackson (JSON serializer) from trying to serialize the entire object graph.

## How to Access Swagger UI

1. **Stop the current running application** (if it's still running)
2. **Start the application fresh**:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
3. **Wait for the startup message**: `Started PlacementTrackerApplication in X.XXX seconds`
4. **Open your browser** and navigate to:
   ```
   http://localhost:8080/swagger-ui.html
   ```

## Using the API

### Step 1: Create a Department
1. In Swagger UI, expand **Department Management** section
2. Click on **POST /api/departments**
3. Click "Try it out"
4. Use this sample data:
```json
{
  "departmentName": "Computer Science Engineering",
  "description": "CSE department focusing on software development and algorithms"
}
```
5. Click "Execute"
6. Note the `id` returned (you'll need this for creating experiences)

### Step 2: Create More Departments
Create departments for your college:
- Electronics and Communication Engineering (ECE)
- Mechanical Engineering (ME)
- Civil Engineering (CE)
- Information Technology (IT)

### Step 3: Share an Interview Experience
1. Expand **Interview Experience Management** section
2. Click on **POST /api/experiences**
3. Click "Try it out"
4. Use this sample data (replace departmentId with the actual ID from step 1):
```json
{
  "studentName": "Rajesh Kumar",
  "companyName": "Google",
  "position": "Software Development Engineer",
  "yearOfPlacement": 2025,
  "departmentId": 1,
  "totalRounds": 4,
  "roundsDescription": "Round 1: Online Test (90 mins)\nRound 2: Technical Interview - DSA\nRound 3: System Design\nRound 4: HR Interview",
  "questionsAsked": "Arrays, Trees, DP, System Design for scalable systems",
  "problemsSolved": "Two Sum, Binary Tree Traversal, LRU Cache Implementation",
  "inPersonInterviewTips": "Be confident, think out loud, ask clarifying questions",
  "crackingStrategy": "Practiced 300+ problems on LeetCode over 6 months",
  "preparationDetails": "Daily 3-4 hours of DSA practice, weekly mock interviews",
  "resources": "LeetCode, GeeksforGeeks, Cracking the Coding Interview book",
  "willingToMentor": true,
  "contactEmail": "rajesh.kumar@example.com",
  "linkedinProfile": "https://linkedin.com/in/rajeshkumar"
}
```

### Step 4: Query Interview Experiences

**Get all experiences:**
- GET `/api/experiences`

**Get experiences by department:**
- GET `/api/experiences/department/1` (replace 1 with your department ID)

**Search by company:**
- GET `/api/experiences/search/company?companyName=Google`

**Get experiences by year:**
- GET `/api/experiences/year/2025`

**Get available mentors:**
- GET `/api/experiences/mentors`

**Filter by department and year:**
- GET `/api/experiences/department/1/year/2025`

## Important Notes

1. **Department ID is required** when creating an interview experience
2. **Create departments first** before adding interview experiences
3. The API uses **DTOs (Data Transfer Objects)** to communicate, not entities directly
4. This prevents circular reference issues and gives you full control over what data is exposed

## Why DTOs Are Used

Instead of returning the Entity objects directly (which contain circular references), the service layer converts:
- `Department` entity → `DepartmentDTO` (simple POJO with no relationships)
- `InterviewExperience` entity → `InterviewExperienceDTO` (includes departmentId and departmentName, but not the full Department object)

This design pattern ensures:
- ✅ No circular reference errors
- ✅ Clean API responses
- ✅ Better security (you control what fields are exposed)
- ✅ API versioning flexibility

## Troubleshooting

### Issue: Still getting 500 error
**Solution:** 
1. Stop the application completely
2. Clean and rebuild: `.\mvnw.cmd clean package`
3. Restart: `.\mvnw.cmd spring-boot:run`
4. Clear browser cache and retry

### Issue: Cannot connect to database
**Solution:**
1. Ensure MySQL is running
2. Check credentials in `application.properties`
3. Verify the database `placement_tracker_db` exists (it should auto-create)

### Issue: Port 8080 in use
**Solution:**
- Change port in `application.properties`: `server.port=8081`
- Update Swagger URL accordingly: `http://localhost:8081/swagger-ui.html`

## Your Application is Ready! 🎉

You now have a fully functional placement tracker backend with:
- ✅ Working Swagger documentation
- ✅ Department management
- ✅ Interview experience sharing
- ✅ Advanced search and filtering
- ✅ Optional mentor contact system
- ✅ No circular reference issues

Happy coding! 🚀

