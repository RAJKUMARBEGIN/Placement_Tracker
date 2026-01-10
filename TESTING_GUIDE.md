# Testing Guide: Admin-Driven Mentor Verification

## Quick Test Checklist

### Phase 1: Backend Compilation ✅
- [ ] `mvn clean compile` - Verify no errors
- [ ] `./mvnw spring-boot:run` - Backend starts successfully
- [ ] Backend connects to MongoDB
- [ ] No errors in logs

---

## Phase 2: Mentor Registration Flow

### Step 1: Register a New Mentor
```
1. Go to http://localhost:3000/register
2. Click "Create Account" 
3. Select "Mentor" role
4. Fill in form:
   - Name: Test Mentor
   - Email: testmentor@example.com
   - Password: Test@123
   - Company: Microsoft
   - Position: Engineer
   - Location: Bangalore
5. Click "Register"
```

### Expected Results:
- ✅ Toast: "Registration successful! Your request has been sent to the admin."
- ✅ Redirected to `/mentor-verify` page
- ✅ Email displayed: "testmentor@example.com"
- ✅ Message shows: "⏳ Waiting for admin to send your verification code..."

### Check Admin Email:
```
1. Check admin email inbox (configured in application.properties)
2. In dev mode: Check backend console for "Approval Link" message
3. Should see:
   - Email from: GCT Placement Cell
   - Subject: "New Mentor Registration Request"
   - Content includes:
     - Mentor name: Test Mentor
     - Mentor email: testmentor@example.com
     - Company: Microsoft
     - Clickable link or URL for approval
```

---

## Phase 3: Admin Approval

### Step 2: Admin Clicks Approval Link
```
1. Copy the approval link from admin email (or console in dev mode)
   Example: http://localhost:8080/api/auth/admin/send-mentor-code?token=abc123&email=testmentor@example.com

2. Click the link or paste in browser

3. Expected: HTML page showing "✅ Verification Code Sent!"
```

### Check Mentor Email:
```
1. Check mentor email inbox (testmentor@example.com)
2. In dev mode: Check backend console for "DEV MODE - Mentor Verification Code"
3. Should see:
   - Subject: "Your Mentor Verification Code - PlaceTrack"
   - 6-digit code (e.g., 347291)
   - Message: "Your admin has approved your registration"
   - NOTE: "The code does NOT expire"
```

---

## Phase 4: Mentor Verification

### Step 3: Enter Verification Code
```
1. Go back to mentor browser still on /mentor-verify page
2. Wait page should have changed to show code input field
3. Enter the 6-digit code from email
   - Input accepts only numbers
   - Auto-formats with letter spacing
4. Click "Verify Code" button
```

### Expected Results:
- ✅ Loading state: "Verifying..."
- ✅ Toast: "Email verified successfully!"
- ✅ Redirected to `/mentor-dashboard`
- ✅ Dashboard displays mentor name and information
- ✅ Can see navbar with "Dashboard" link

---

## Phase 5: Mentor Login

### Step 4: Test Login with Verified Mentor
```
1. Logout from mentor dashboard
2. Go to /login
3. Enter:
   - Email: testmentor@example.com
   - Password: Test@123
4. Click "Sign In"
```

### Expected Results:
- ✅ Toast: "Login successful!"
- ✅ Redirected to `/mentor-dashboard`
- ✅ Dashboard loads with mentor information

---

## Phase 6: Code Reusability (No Expiry)

### Step 5: Test Code Doesn't Expire
```
1. On mentor-verify page, note the code used
2. Logout and login again
3. Should be redirected to verification page (not dashboard)
4. Try to enter the SAME code again
5. Should NOT say "Code expired"
```

### Expected Results:
- ✅ Same code still works
- ✅ Verification succeeds again
- ✅ Access granted to dashboard
- ✅ No time pressure or expiry message

---

## Phase 7: Code Resend

### Step 6: Test Code Resend
```
1. Create another mentor (new email)
2. Admin sends code (from email link)
3. On verification page, click "Request Code" button
4. Should see: "Requesting..." during processing
```

### Expected Results:
- ✅ Toast: "Verification code sent to your email!"
- ✅ New code generated and sent to mentor email
- ✅ Old code should no longer work
- ✅ New code should work

---

## Phase 8: Error Handling

### Test 8A: Invalid Code
```
1. Mentor on verification page
2. Enter wrong 6-digit code
3. Click "Verify Code"
```

### Expected Results:
- ✅ Toast: "Invalid verification code"
- ✅ No access to dashboard
- ✅ Can try again with different code

---

### Test 8B: Incomplete Code
```
1. Mentor on verification page
2. Enter only 5 digits
3. Click "Verify Code" (button should be disabled)
```

### Expected Results:
- ✅ Button is disabled (greyed out)
- ✅ Cannot submit incomplete code
- ✅ Helper text: "Enter the 6-digit code sent to your email"

---

### Test 8C: Mentor Not Verified Cannot Login
```
1. Create new mentor account
2. DO NOT verify (don't enter code)
3. Logout
4. Try to login with that mentor
```

### Expected Results:
- ✅ Password accepted
- ✅ Toast: "Your account is pending admin verification. Please wait..."
- ✅ Redirected to `/mentor-verify` page
- ✅ "Waiting for admin..." message shown

---

## Detailed Test Scenarios

### Scenario A: Complete Happy Path
```
Timeline:
T0: Mentor registers via /register
    → Email sent to admin
    → Mentor sees verification page
    
T1: Admin clicks approval link in email
    → Code generated
    → Code sent to mentor email
    
T2: Mentor enters code
    → Code verified (no expiry)
    → Mentor logged in
    → Dashboard accessible
    
T3: Mentor logs out and back in
    → Same code still works (no expiry)
    → Dashboard accessible
    
✅ Expected: Complete success at all steps
```

---

### Scenario B: Multiple Mentors
```
1. Register Mentor A (email: mentorA@example.com)
2. Register Mentor B (email: mentorB@example.com)
3. Admin approves both (gets 2 emails)
4. Each mentor receives unique code
5. Both can verify with their own codes
6. Both can login independently

✅ Expected: Isolation and uniqueness maintained
```

---

### Scenario C: Code Reuse (No Expiry)
```
1. Mentor verifies with code 347291
2. Logs out
3. Logs back in
4. Code 347291 still works (verify again)
5. Logs out
6. Waits 24+ hours (or skip this, test immediately)
7. Logs back in
8. Code 347291 STILL WORKS

✅ Expected: Code works indefinitely
```

---

### Scenario D: Resend Code
```
1. Mentor on verification page
2. Hasn't entered code yet
3. Clicks "Request Code"
4. Email sent with same/new code
5. Enters code
6. Verification succeeds

✅ Expected: Resend works, code accepted
```

---

## API Testing (Advanced)

### Test Admin Send Code Endpoint
```bash
# Using curl to test the admin code sending endpoint
curl -X GET "http://localhost:8080/api/auth/admin/send-mentor-code?email=testmentor@example.com&token=550e8400-e29b-41d4-a716-446655440000"

# Expected: HTML response with "✅ Code Sent!" message
# Or error if token doesn't match
```

---

### Test Verify Code Endpoint
```bash
# Test the code verification endpoint
curl -X POST "http://localhost:8080/api/auth/mentors/verify-code" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testmentor@example.com",
    "verificationCode": "347291"
  }'

# Expected: 
# {
#   "success": true,
#   "message": "Email verified successfully",
#   "user": { ...mentor details... }
# }
```

---

### Test Resend Code Endpoint
```bash
# Test the code resend endpoint
curl -X POST "http://localhost:8080/api/auth/mentors/send-verification-code" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testmentor@example.com"
  }'

# Expected:
# {
#   "success": true,
#   "message": "Verification code sent to your email"
# }
```

---

## Console Output to Look For

### In Dev Mode (No Email Server):

#### Mentor Registration:
```
Approval Link: http://localhost:8080/api/auth/admin/send-mentor-code?token=550e8400-e29b-41d4-a716-446655440000&email=testmentor@example.com
```

#### Admin Sends Code:
```
DEV MODE - Mentor Verification Code for testmentor@example.com: 347291
```

---

## Frontend Testing Tips

### Check Verification Page Elements
```javascript
// In browser console (F12 → Console tab):

// Check if email is displayed
document.querySelector('.verification-email').textContent
// Should show: "Email: testmentor@example.com"

// Check if waiting message shows
document.querySelector('.waiting-for-code-message')
// Should exist until code received

// Check if code input works
document.querySelector('.code-input')
// Should only accept numbers 0-9
```

---

## Performance Testing

### Test Multiple Registrations
```
1. Register 5 different mentors in rapid succession
2. Verify all 5 get proper admin emails
3. Admin approves all 5
4. Verify all 5 get codes
5. All 5 can verify and login

✅ Expected: No race conditions, all succeed
```

---

## Rollback Testing

### If Something Goes Wrong:
```
1. Revert User.java changes
2. Revert AuthService changes
3. Rebuild with mvn clean compile
4. System should work with old logic

Restore from git:
git checkout HEAD -- Placement_Tracker/src/main/java/com/quizapplication/placement_tracker/
```

---

## Sign-Off Checklist

- [ ] Backend compiles successfully
- [ ] Mentor registration sends email to admin
- [ ] Admin email contains approval link
- [ ] Admin link successfully generates code
- [ ] Mentor receives code email
- [ ] Mentor can verify with code
- [ ] Mentor can login and access dashboard
- [ ] Code doesn't expire (works after 24 hours)
- [ ] Invalid codes are rejected
- [ ] Multiple mentors work independently
- [ ] Code resend works
- [ ] Waiting message shows before code sent
- [ ] No errors in backend/frontend console

---

## Quick Debug Commands

### Check if Mentor Exists:
```bash
# In MongoDB:
db.users.findOne({ email: "testmentor@example.com" })

# Should show:
# {
#   email: "testmentor@example.com",
#   verificationCode: "347291",
#   registrationStatus: "WAITING_FOR_CODE",
#   adminApprovalToken: "550e8400...",
#   isVerified: false
# }
```

---

### Check Registration Status:
```bash
# After admin sends code:
db.users.findOne({ email: "testmentor@example.com" })

# registrationStatus should now be: "WAITING_FOR_CODE"
# verificationCode should have a 6-digit number
```

---

### Check After Verification:
```bash
# After mentor enters code:
db.users.findOne({ email: "testmentor@example.com" })

# Should show:
# {
#   registrationStatus: "VERIFIED",
#   isVerified: true,
#   isApproved: true,
#   verificationCode: null,
#   adminApprovalToken: null
# }
```

---

## Email Configuration for Testing

### Dev Mode (No Setup Needed):
- Codes print to backend console
- No actual email sent
- Can test flow without email server

### Production Mode (Requires Setup):
```properties
# application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

app.admin.email=admin@gct.ac.in
app.base.url=http://localhost:8080
```

---

## Success Metrics

✅ All tests pass
✅ No errors in logs
✅ Mentor flow is smooth
✅ Admin has clear control
✅ Codes never expire
✅ No time pressure
✅ System is secure

---

You're ready to test! 🚀
