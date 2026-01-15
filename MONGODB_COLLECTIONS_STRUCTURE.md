# MongoDB Collections Structure

## Current Database: placement_tracker_db

### Collections Overview

Your MongoDB database has **7 collections**:

---

## 1. ✅ **admins** Collection
**Status**: Properly configured  
**Entity**: `Admin.java`

### Fields:
- `id` - MongoDB ObjectId
- `username` - Unique, indexed
- `password` - Hashed password
- `fullName` - Admin's full name
- `email` - Admin email address
- `createdAt` - When admin account was created
- `lastLogin` - Last login timestamp
- `isActive` - Boolean (active/inactive status)

### Purpose:
Stores admin user accounts who can manage the system, approve mentors, and access admin dashboard.

---

## 2. ✅ **companies** Collection
**Status**: Properly configured  
**Entity**: `Company.java`

### Fields:
- `id` - MongoDB ObjectId
- `companyName` - Unique, indexed company name
- `description` - Company description
- `industry` - Industry type
- `website` - Company website URL
- `logoUrl` - Company logo URL
- `headquarters` - Company headquarters location
- `interviewExperienceIds` - List of experience IDs linked to this company
- `createdAt` - When company was added
- `createdById` - User ID who created the company entry
- `isActive` - Boolean status

### Purpose:
Stores company information for all companies where students have been placed or interviewed. Can be linked with experiences.

---

## 3. ✅ **departments** Collection
**Status**: Working correctly  
**Entity**: `Department.java`

### Fields:
- `id` - MongoDB ObjectId
- `departmentName` - Department name (e.g., "Computer Science Engineering")
- `departmentCode` - Short code (e.g., "CSE")
- `description` - Department description
- `isActive` - Boolean status

### Purpose:
Stores academic departments. Users and experiences are linked to departments.

---

## 4. ✅ **mentors** Collection
**Status**: Properly configured (separate from users)  
**Entity**: `Mentor.java`

### Fields:
- `id` - MongoDB ObjectId
- `fullName` - Mentor's full name
- `email` - Unique email address
- `phoneNumber` - Contact number
- `linkedinProfile` - LinkedIn URL
- `placedCompany` - Company where mentor was placed
- `placedPosition` - Job position
- `placementYear` - Year of placement
- `graduationYear` - Year of graduation
- `departmentIds` - List of department IDs mentor can advise
- `createdAt` - Registration timestamp
- `isActive` - Boolean status

### Purpose:
**Separate collection** for verified mentors who can guide students. These are experienced professionals willing to mentor.

---

## 5. ⚠️ **interview_experiences** Collection
**Status**: Currently being used by your frontend  
**Entity**: `InterviewExperience.java`

### Fields:
- `id` - MongoDB ObjectId
- `studentName` - Student's name
- `companyName` - Company name
- `companyId` - Reference to companies collection
- `mentorId` - Reference to mentor if applicable
- `position` - Job position applied for
- `yearOfPlacement` - Year (e.g., 2026)
- `departmentId` - Reference to department
- `totalRounds` - Number of interview rounds
- `roundsDescription` - Detailed description of rounds
- `questionsAsked` - Questions asked during interview
- `problemsSolved` - Problems solved
- `inPersonInterviewTips` - Tips for in-person interviews
- `crackingStrategy` - Strategy used to crack the interview
- `preparationDetails` - How student prepared
- `resources` - Study materials/resources used
- `willingToMentor` - Boolean (if student wants to mentor)
- `contactEmail` - Contact email
- `contactPhone` - Contact phone
- `linkedinProfile` - LinkedIn URL
- `submittedAt` - Submission timestamp
- **Attachment fields:**
  - `attachmentFileName` - ZIP file name
  - `attachmentUrl` - File path/URL
  - `attachmentSize` - File size in bytes
  - `resourceFileName` - (alias for attachmentFileName)
  - `resourceFileUrl` - (alias for attachmentUrl)
  - `resourceFileSize` - (alias for attachmentSize)

### Purpose:
**THIS IS YOUR ACTIVE COLLECTION** - Stores interview experiences shared by students including preparation strategies, questions asked, and ZIP file attachments with study materials.

### Frontend Usage:
- `experienceAPI` in api.js points to `/api/experiences` → `interview_experiences`
- Used in: AddExperience.js, Experiences.js, ExperienceDetail.js

---

## 6. ⚠️ **placement_experiences** Collection
**Status**: Exists but NOT currently used by frontend  
**Entity**: `PlacementExperience.java`

### Fields:
- `id` - MongoDB ObjectId
- **Student Info:**
  - `studentName`
  - `rollNumber`
  - `department`
  - `personalEmail`
  - `contactNumber`
- **Company Info:**
  - `companyName`
  - `companyType` (IT, Core, etc.)
  - `placementYear`
  - `salary`
  - `internOffered`
  - `hasBond`
  - `bondDetails`
- **Selection Process:**
  - `totalRounds`
  - `roundsJson` - JSON string with round-by-round details
- **Summary:**
  - `overallExperience`
  - `generalTips`
  - `areasToPrepareFinal`
  - `suggestedResources`
- **Attachments:**
  - `attachmentFileName`
  - `attachmentUrl`
  - `attachmentSize`
- **Status:**
  - `finalResult` (SELECTED, REJECTED, PENDING)
  - `submittedAt`
  - `academicYear`

### Purpose:
More comprehensive format for placement experiences with detailed round information stored as JSON. **Currently NOT being used** by your frontend application.

### Note:
This collection exists but your frontend uses `interview_experiences` instead. You have two options:
1. Keep using `interview_experiences` (current setup)
2. Migrate to `placement_experiences` (requires frontend changes)

---

## 7. ✅ **users** Collection
**Status**: Properly configured  
**Entity**: `User.java`

### Fields:
- `id` - MongoDB ObjectId
- `email` - Unique email address
- `password` - Hashed password
- `fullName` - User's full name
- `role` - UserRole enum (STUDENT, MENTOR, ADMIN)
- `departmentId` - Reference to department
- `rollNumber` - Student roll number
- `yearOfStudy` - Current year (1-4)
- `graduationYear` - Expected graduation year
- `phoneNumber` - Contact number
- `linkedinProfile` - LinkedIn URL
- **For mentors in users collection:**
  - `placedCompany` - Company where placed
  - `placedPosition` - Job position
  - `placementYear` - Year of placement
  - `location` - Current location
  - `contactVisibility` - "PUBLIC" or "ADMIN_ONLY"
  - `isApproved` - Mentor approval status
  - `registrationStatus` - "REGISTERED", "WAITING_FOR_CODE", "VERIFIED"
  - `verificationCode` - Admin verification code
  - `isVerified` - Boolean
  - `adminApprovalToken` - Security token
- `createdAt` - Registration timestamp
- `lastLogin` - Last login time
- `isActive` - Boolean status

### Purpose:
Stores **student accounts** and **user-role mentors**. Students register here, and can convert to mentors through verification process.

---

## Summary of Your Current Setup

### ✅ What's Working:
1. **interview_experiences** collection is being used by your frontend
2. All attachment fields (zip files) are properly configured with both naming conventions
3. Department linking is working
4. Students can add experiences with ZIP file metadata

### ⚠️ Duplication Issues:
1. **Two experience systems exist:**
   - `interview_experiences` (currently used)
   - `placement_experiences` (not used but exists)
   
2. **Two mentor systems exist:**
   - `mentors` collection (separate collection)
   - `users` collection with role=MENTOR (integrated in users)

### 🔧 Recommendations:

**Option 1: Keep Current Setup (Recommended)**
- Continue using `interview_experiences` 
- Use `mentors` collection for mentors
- Use `users` collection for students only
- Archive or delete `placement_experiences` if not needed

**Option 2: Consolidate**
- Migrate all data from `interview_experiences` to `placement_experiences`
- Update frontend to use `placementAPI` instead of `experienceAPI`
- Benefits: More detailed round-by-round tracking

### 📋 Current Data Flow:
```
Student registers → users collection
Student adds experience → interview_experiences collection
Experience includes → ZIP file metadata (attachmentFileName, attachmentUrl, attachmentSize)
Admin manages → admins collection
Mentors exist in → mentors collection (separate)
Companies tracked → companies collection
```

---

## File Attachment System

### Current Implementation:
Your system stores **file metadata only**, not the actual files:

- `attachmentFileName` - "study_materials.zip"
- `attachmentUrl` - "/uploads/study_materials.zip" (placeholder)
- `attachmentSize` - File size in bytes

### What's Missing:
Actual file upload to server or cloud storage. Currently it's metadata-only.

### To Enable Full File Upload:
You would need to implement:
1. File upload endpoint in backend (using Spring MultipartFile)
2. File storage (local filesystem or cloud like AWS S3)
3. Frontend file upload using FormData
4. File download endpoint

---

## Verification Checklist

Run these checks in MongoDB Compass:

### ✅ 1. Admins Collection
- Should have admin accounts with username, password, email
- Check: `db.admins.find({})`

### ✅ 2. Companies Collection
- Should have company entries with companyName
- Check: `db.companies.find({})`

### ✅ 3. Departments Collection
- Already working correctly
- Check: `db.departments.find({})`

### ✅ 4. Mentors Collection
- Should have mentor details (separate from users)
- Check: `db.mentors.find({})`

### ✅ 5. Interview Experiences (Active Collection)
- Should have experiences with all fields including attachmentFileName, attachmentUrl, attachmentSize
- Check: `db.interview_experiences.find({})`

### ⚠️ 6. Placement Experiences (Inactive)
- May be empty or have old data
- Check: `db.placement_experiences.find({})`

### ✅ 7. Users Collection
- Should have student accounts with role, email, fullName, departmentId
- Check: `db.users.find({ role: "STUDENT" })`

---

## Next Steps

1. **Verify Data in MongoDB Compass:**
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Open `placement_tracker_db` database
   - Check each collection listed above

2. **Decide on Experience Collection:**
   - Keep using `interview_experiences` (current), OR
   - Migrate to `placement_experiences` (more detailed)

3. **Implement Real File Upload:**
   - Add file upload endpoint in backend
   - Add cloud storage (AWS S3) or local file system
   - Update frontend to upload actual files

4. **Clean Up Duplicates:**
   - Decide if you need both `mentors` and users with role=MENTOR
   - Decide if you need both experience collections

---

Generated on: January 14, 2026
