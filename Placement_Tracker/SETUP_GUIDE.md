# Quick Start Guide - Placement Tracker

## Setup Instructions

### 1. Database Setup

Before running the application, ensure MySQL is installed and running.

**Option A: Using MySQL Workbench or Command Line**
```sql
-- The application will auto-create the database, but you can manually create it:
CREATE DATABASE placement_tracker_db;
```

**Option B: Update Database Credentials**
Edit `src/main/resources/application.properties` and update:
```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 2. Run the Application

**Using Maven Wrapper (Recommended):**
```bash
.\mvnw.cmd spring-boot:run
```

**Or using your IDE:**
- Open the project in IntelliJ IDEA or Eclipse
- Run `PlacementTrackerApplication.java`

### 3. Access the Application

Once the application starts successfully, you'll see:
```
Started PlacementTrackerApplication in X.XXX seconds
```

**Access Swagger UI:**
```
http://localhost:8080/swagger-ui.html
```

## Testing the API

### Step 1: Create a Department
```bash
curl -X POST http://localhost:8080/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "departmentName": "Computer Science Engineering",
    "description": "Department of Computer Science and Engineering"
  }'
```

### Step 2: Create Sample Departments
Create departments for your college:
- Computer Science Engineering (CSE)
- Electronics and Communication Engineering (ECE)
- Mechanical Engineering (ME)
- Civil Engineering (CE)
- Information Technology (IT)

### Step 3: Share an Interview Experience
```bash
curl -X POST http://localhost:8080/api/experiences \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Rajesh Kumar",
    "companyName": "Microsoft",
    "position": "Software Development Engineer",
    "yearOfPlacement": 2025,
    "departmentId": 1,
    "totalRounds": 5,
    "roundsDescription": "Round 1: Online Test (90 mins) - MCQs + 2 Coding\nRound 2: Technical Interview 1 (1 hour) - DSA focused\nRound 3: Technical Interview 2 (1 hour) - System Design\nRound 4: Technical Interview 3 (45 mins) - Problem Solving\nRound 5: HR Round (30 mins)",
    "questionsAsked": "Arrays: Sliding Window, Two Pointers\nTrees: Binary Tree Traversals, BST operations\nGraphs: DFS, BFS, Shortest Path\nDP: Knapsack, Longest Common Subsequence\nSystem Design: Design URL Shortener, Design Twitter Feed",
    "problemsSolved": "1. Longest Substring Without Repeating Characters\n2. Binary Tree Level Order Traversal\n3. Course Schedule (Graph)\n4. Maximum Subarray (Kadane Algorithm)\n5. Implement LRU Cache",
    "inPersonInterviewTips": "1. Always think out loud\n2. Ask clarifying questions before jumping to solution\n3. Start with brute force, then optimize\n4. Write clean, readable code\n5. Test your code with edge cases\n6. Be honest if you do not know something",
    "crackingStrategy": "1. Started preparation 8 months before placements\n2. Solved 400+ problems on LeetCode (150 Easy, 200 Medium, 50 Hard)\n3. Focused on company-specific questions\n4. Did mock interviews every week\n5. Revised all important concepts 2 weeks before interview\n6. Maintained a preparation journal",
    "preparationDetails": "Daily Schedule:\n- Morning (2 hours): DSA problem solving\n- Evening (1 hour): System design or CS fundamentals\n- Weekend: Mock interviews and revision\n\nTopics Covered:\n- Data Structures: Arrays, LinkedList, Stack, Queue, Trees, Graphs, Heap, Trie\n- Algorithms: Sorting, Searching, Recursion, DP, Greedy, Backtracking\n- System Design: Scalability, Load Balancing, Caching, Databases\n- CS Fundamentals: OS, DBMS, Networks, OOP",
    "resources": "Online Platforms:\n- LeetCode (Primary)\n- GeeksforGeeks\n- InterviewBit\n- Codeforces (for practice)\n\nBooks:\n- Cracking the Coding Interview by Gayle Laakmann McDowell\n- Introduction to Algorithms (CLRS)\n\nYouTube Channels:\n- Abdul Bari (Algorithms)\n- Striver (DSA)\n- Gaurav Sen (System Design)\n- Tech Dummies (Interview Prep)\n\nSystem Design:\n- System Design Primer (GitHub)\n- Designing Data-Intensive Applications (Book)",
    "willingToMentor": true,
    "contactEmail": "rajesh.kumar@example.com",
    "linkedinProfile": "https://linkedin.com/in/rajeshkumar"
  }'
```

## Common API Operations

### Get All Experiences by Department
```bash
GET http://localhost:8080/api/experiences/department/1
```

### Search by Company Name
```bash
GET http://localhost:8080/api/experiences/search/company?companyName=Google
```

### Get Experiences by Year
```bash
GET http://localhost:8080/api/experiences/year/2025
```

### Get Available Mentors
```bash
GET http://localhost:8080/api/experiences/mentors
```

### Filter by Department and Year
```bash
GET http://localhost:8080/api/experiences/department/1/year/2025
```

## Database Tables

The application creates two main tables:

**departments:**
- Stores all college departments
- Each department can have multiple interview experiences

**interview_experiences:**
- Stores complete interview details
- Links to department via foreign key
- Includes optional mentoring contact info

## Troubleshooting

### Issue: Port 8080 already in use
**Solution:** Change port in `application.properties`:
```properties
server.port=8081
```

### Issue: Cannot connect to MySQL
**Solution:** 
1. Ensure MySQL service is running
2. Check username/password in `application.properties`
3. Verify MySQL is listening on port 3306

### Issue: Database not created automatically
**Solution:** Create it manually:
```sql
CREATE DATABASE placement_tracker_db;
```

## Next Steps

1. **Populate Departments**: Add all departments in your college
2. **Collect Experiences**: Reach out to placed seniors to share their experiences
3. **Test API**: Use Swagger UI to test all endpoints
4. **Integration**: Connect with frontend (React/Angular/Vue) if needed

## Features Implemented

✅ Department Management (CRUD)
✅ Interview Experience Sharing (CRUD)
✅ Search by Company, Year, Department
✅ Mentor Directory (Optional Contact Info)
✅ Comprehensive Experience Details
✅ MySQL Database Integration
✅ Swagger API Documentation
✅ Input Validation
✅ Exception Handling
✅ Auto-timestamp on submission

## Contact

For any issues or questions, refer to the main README.md file.

