# Mentor Registration & Admin Notification Testing Guide

## ✅ Issues Fixed

### 1. Dashboard Routing Issue - RESOLVED

**Problem**: When clicking "Go to Dashboard" from the home page hero section, users were redirected to `/dashboard` which doesn't exist, resulting in a blank page.

**Solution**: Updated [Home.js](placement-tracker-frontend/src/pages/Home.js) to dynamically route users to their role-specific dashboards:

- **Admin** → `/admin-dashboard`
- **Student** → `/student-dashboard`
- **Mentor** → `/mentor-dashboard`
- **Not logged in** → `/login`

**Code Changes**:

```javascript
// Added getDashboardUrl() function that checks:
// 1. localStorage for userRole === "ADMIN"
// 2. user.role from AuthContext
// 3. Returns appropriate dashboard URL
```

### 2. Mentor Notification System - ALREADY IMPLEMENTED ✓

The mentor notification system was already fully implemented and working. Here's how it works:

---

## 🔄 Complete Mentor Registration Flow

### Step 1: Mentor Creates Account

**URL**: http://localhost:3000/mentor-register

**Required Fields**:

- ✅ Full Name
- ✅ Email (@gct.ac.in domain only)
- ✅ Password (minimum 8 characters)
- ✅ Department
- ✅ Placed Company
- ✅ **LinkedIn Profile (MANDATORY)** ⚠️
- Phone Number (optional)
- Placed Position (optional)
- Placement Year (optional)
- Graduation Year (optional)

**What Happens**:

1. Form validates all required fields
2. **LinkedIn profile validation** ensures it's not empty
3. Backend creates user with `role: MENTOR`, `isApproved: false`, `isVerified: false`
4. **Admin email notification sent immediately** with full mentor details
5. Mentor redirected to verification code page

---

### Step 2: Admin Receives Email Notification

**Admin Email**: harshavardhinin6@gmail.com

**Email Content Includes**:

```
═══════════════════════════════════════════════════════════════════════
                     MENTOR REGISTRATION DETAILS
═══════════════════════════════════════════════════════════════════════

👤 PERSONAL INFORMATION:
   Full Name:           [Mentor Name]
   Email:               [mentor@gct.ac.in]
   Phone Number:        [Phone or "Not provided"]
   LinkedIn Profile:    [LinkedIn URL]

🏢 PLACEMENT INFORMATION:
   Company:             [Company Name]
   Position:            [Job Title]
   Placement Year:      [Year]
   Current Location:    [Location]

🎓 ACADEMIC INFORMATION:
   Department ID:       [Department]
   Graduation Year:     [Year]

🔒 PRIVACY SETTINGS:
   Contact Visibility:  [PUBLIC/PRIVATE]

═══════════════════════════════════════════════════════════════════════

⚠️ IMPORTANT - LinkedIn Profile is MANDATORY for approval!

═══════════════════════════════════════════════════════════════════════

📋 ACTION REQUIRED:

✅ TO APPROVE: Click the link below to send verification code to mentor
   [Approval Link]

❌ TO REJECT: Log in to Admin Dashboard and reject from pending mentors section
   Dashboard: http://localhost:3000/admin-dashboard
```

---

### Step 3: Admin Reviews in Dashboard

**Admin Login**:

- URL: http://localhost:3000/login
- Email: harshavardhinin6@gmail.com
- Password: admin123

**Admin Dashboard Features**:

#### A. Pending Mentor Approvals Section (Top Priority)

When pending mentors exist, a prominent section displays:

- ⏳ **"Pending Mentor Approvals"** heading
- Count badge: "X awaiting approval"
- Mentor cards with all details:
  - Avatar with first letter
  - Full name
  - 📧 Email
  - 📱 Phone number
  - 🏢 Company & Position
  - 📅 Placement year
  - 🎓 Graduation year
  - 🔗 LinkedIn profile (clickable link)
  - 🎯 Department

**Action Buttons**:

1. **👁️ View Details** - Opens modal with complete information
2. **✓ Approve** - Sends verification code to mentor's email
3. **✗ Reject** - Deletes mentor account with confirmation

#### B. Two-Tab Management System

1. **👥 Manage Mentors Tab**

   - View all approved mentors
   - Edit mentor information
   - Delete mentor accounts
   - Add new mentors manually

2. **👨‍🎓 Manage Users Tab**
   - View all registered users (students, mentors, admins)
   - Edit user details
   - Activate/Deactivate users
   - Delete user accounts

---

### Step 4: Admin Approves Mentor

**Option A: Email Link** (Direct Approval)

- Click the approval link from email
- Backend sends verification code to mentor
- Mentor status: `isApproved: true`, `registrationStatus: WAITING_FOR_CODE`

**Option B: Dashboard Approval** (Recommended)

1. Login to admin dashboard
2. Navigate to "Pending Mentor Approvals" section
3. Review mentor details carefully
4. Click **"✓ Approve"** button
5. Success message: "Mentor approved successfully!"
6. Verification code sent to mentor's email
7. Mentor removed from pending list

**Option C: Rejection**

1. Click **"✗ Reject"** button
2. Confirm deletion popup
3. Mentor account permanently deleted
4. Mentor removed from pending list

---

### Step 5: Mentor Receives Verification Code

**Email to Mentor**:

```
Subject: 🎉 Your GCT PlaceTrack Mentor Account - Verification Code

Dear [Mentor Name],

Congratulations! Your mentor account has been approved by the admin.

Your Verification Code: [6-DIGIT CODE]

This code will expire in 10 minutes.

Please enter this code on the verification page to complete your registration.

Best regards,
GCT Placement Cell
```

---

### Step 6: Mentor Enters Verification Code

**URL**: http://localhost:3000/mentor-verify

**Process**:

1. Mentor enters email and 6-digit code
2. Backend validates code (must match, not expired)
3. If valid:

   - `isVerified: true`
   - `registrationStatus: ACTIVE`
   - Success message: "Account verified! You can now log in."
   - Redirected to login page

4. If invalid:
   - Error message shown
   - Can request resend (if admin re-approves)

---

### Step 7: Mentor Can Now Login

**URL**: http://localhost:3000/login

**Credentials**: Mentor's registered email + password

**Access**:

- Full mentor dashboard
- Can add interview experiences
- Can view all departments
- Can connect with students

---

## 🧪 Testing Scenarios

### Test 1: Complete Registration Flow

1. ✅ Register new mentor at http://localhost:3000/mentor-register
2. ✅ Check admin email (harshavardhinin6@gmail.com) for notification
3. ✅ Login to admin dashboard at http://localhost:3000/login
4. ✅ Verify mentor appears in "Pending Mentor Approvals"
5. ✅ Click "View Details" to see full information
6. ✅ Click "Approve" button
7. ✅ Check mentor's email for verification code
8. ✅ Go to http://localhost:3000/mentor-verify and enter code
9. ✅ Login as mentor at http://localhost:3000/login
10. ✅ Access mentor dashboard

### Test 2: LinkedIn Validation

1. ✅ Try registering mentor WITHOUT LinkedIn profile
2. ✅ Should show error: "LinkedIn profile is mandatory for mentor registration"
3. ✅ Cannot submit form until LinkedIn field is filled

### Test 3: Dashboard Routing

1. ✅ Login as admin (harshavardhinin6@gmail.com)
2. ✅ Go to home page (click "Home" in navbar)
3. ✅ Click "Go to Dashboard" in hero section
4. ✅ Should redirect to `/admin-dashboard` (not blank page)
5. ✅ Logout
6. ✅ Login as student
7. ✅ Click "Go to Dashboard" → should go to `/student-dashboard`
8. ✅ Login as mentor
9. ✅ Click "Go to Dashboard" → should go to `/mentor-dashboard`

### Test 4: Rejection Flow

1. ✅ Register new mentor
2. ✅ Login to admin dashboard
3. ✅ In "Pending Mentor Approvals", click "Reject"
4. ✅ Confirm deletion popup
5. ✅ Mentor account deleted from database
6. ✅ Mentor removed from pending list
7. ✅ Mentor cannot login (account doesn't exist)

### Test 5: Admin User Management

1. ✅ Login as admin
2. ✅ Click "Manage Users" tab
3. ✅ View all users (students, mentors, admins)
4. ✅ Click "View Details" on any user
5. ✅ Click "Edit" to modify user information
6. ✅ Click "Deactivate" to disable user account
7. ✅ Click "Activate" to re-enable account
8. ✅ Click "Delete" to remove user

---

## 📧 Email Configuration

**Backend**: [application.properties](Placement_Tracker/src/main/resources/application.properties)

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=harshavardhinin6@gmail.com
spring.mail.password=[App Password - Check properties file]
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Admin email for notifications
app.admin.email=harshavardhinin6@gmail.com
```

**Important**: Make sure Gmail App Password is configured correctly in application.properties

---

## 🎯 Key Features Summary

### ✅ What's Working

1. **Dashboard Routing** - Now correctly routes based on user role
2. **Mentor Registration** - Complete with LinkedIn validation
3. **Admin Email Notifications** - Sent immediately with full details
4. **Admin Dashboard** - Shows pending mentors prominently
5. **Approval System** - Admin can approve/reject with one click
6. **Verification Flow** - Mentor receives code and completes registration
7. **User Management** - Admin can view/edit/delete all users
8. **Two-Tab System** - Separate management for mentors and users

### 🔐 Security Features

- ✅ LinkedIn mandatory for mentors
- ✅ Email domain validation (@gct.ac.in only)
- ✅ Password strength requirements
- ✅ Admin approval required for mentors
- ✅ Verification code expiry (10 minutes)
- ✅ Secure tokens for approval links

### 🎨 UI/UX Features

- ✅ Pending count badge
- ✅ Clear action buttons (Approve/Reject/View)
- ✅ Modal popups for detailed views
- ✅ Toast notifications for all actions
- ✅ Confirmation dialogs for destructive actions
- ✅ Tab navigation for different management sections

---

## 🚀 Quick Start Testing

1. **Start Backend**:

   ```powershell
   cd "c:\Users\harsh\OneDrive\Desktop\fnl_project\demo\Placement_Tracker"
   mvn spring-boot:run
   ```

   Backend runs on: http://localhost:8080

2. **Start Frontend**:

   ```powershell
   cd "c:\Users\harsh\OneDrive\Desktop\fnl_project\demo\placement-tracker-frontend"
   npm run dev
   ```

   Frontend runs on: http://localhost:3000

3. **Access Points**:

   - Home: http://localhost:3000
   - Admin Login: http://localhost:3000/login (email: harshavardhinin6@gmail.com, password: admin123)
   - Mentor Register: http://localhost:3000/mentor-register
   - Mentor Verify: http://localhost:3000/mentor-verify

4. **Check Admin Email**: harshavardhinin6@gmail.com for notifications

---

## 🐛 Troubleshooting

### Issue: Dashboard shows blank page

**Solution**: Fixed! Dashboard now routes correctly based on user role.

### Issue: Not receiving emails

**Check**:

1. Gmail App Password configured in application.properties
2. Backend console for email send confirmation
3. Gmail account settings allow "Less secure app access"
4. Check spam folder

### Issue: Mentor not appearing in pending list

**Check**:

1. Backend logs for registration success
2. MongoDB for user with `isApproved: false`
3. Refresh admin dashboard page

### Issue: Verification code not working

**Check**:

1. Code entered correctly (6 digits)
2. Code not expired (10 minute limit)
3. Email matches the one used during registration

---

## 📱 Contact

For any issues or questions:

- Admin Email: harshavardhinin6@gmail.com
- Check backend logs for detailed error messages
- Check browser console for frontend errors

---

**Last Updated**: January 13, 2026
**Status**: ✅ All systems operational
