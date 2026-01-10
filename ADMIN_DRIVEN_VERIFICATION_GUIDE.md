# Admin-Driven Mentor Verification System - Implementation Guide

## Overview
The mentor approval system has been completely redesigned. Instead of the previous system where mentors received verification codes immediately after registration, the new system is **admin-driven**:

- Mentor registers → Registration request sent to admin email
- Admin receives email with "Send Verification Code" button/link
- Admin clicks link to send code to mentor
- Mentor receives code and enters it anytime (NO TIME EXPIRY)
- Mentor accesses dashboard

---

## New User Flow

### Registration Flow
```
1. Mentor fills registration form
2. Submits → Data saved with status "REGISTERED"
3. Admin receives email with secure approval link
4. Mentor sees verification page (shows "Waiting for admin approval")
5. Admin clicks link in email
6. Code generated and sent to mentor
7. Mentor receives code (in email or admin panel shows it)
8. Mentor enters code on verification page
9. Status changes to "VERIFIED"
10. Mentor can login and access dashboard
```

### Login Flow (for already-registered mentors)
```
1. Mentor logs in with email and password
2. System checks if isVerified = true
3. If verified: Login successful, go to dashboard
4. If not verified: Show verification page, ask mentor to wait for admin
```

---

## Backend Changes

### 1. User Entity (`User.java`)

**Removed Fields:**
- `LocalDateTime verificationCodeExpiry` - NO MORE TIME LIMITS

**Added Fields:**
```java
// Registration status: REGISTERED -> WAITING_FOR_CODE -> VERIFIED
private String registrationStatus = "REGISTERED";

// Token for admin to send verification code securely
private String adminApprovalToken;
```

**Existing Fields (Modified Purpose):**
- `String verificationCode` - Now only set when admin sends it
- `Boolean isVerified` - Set to true only after mentor enters correct code

**Getters/Setters Added:**
```java
public String getRegistrationStatus()
public void setRegistrationStatus(String registrationStatus)
public String getAdminApprovalToken()
public void setAdminApprovalToken(String adminApprovalToken)
```

---

### 2. AuthService (`AuthService.java`)

#### Modified `register()` Method
**Key Changes:**
- Does NOT generate verification code immediately
- Sets `registrationStatus = "REGISTERED"`
- Generates secure `adminApprovalToken` (UUID)
- Sends registration request email to admin (not to mentor)

```java
if (registerDTO.getRole() == UserRole.MENTOR) {
    user.setIsApproved(false);
    user.setIsVerified(false);
    user.setRegistrationStatus("REGISTERED");
    user.setAdminApprovalToken(generateSecureToken());  // Secure token
}

User savedUser = userRepository.save(user);

if (registerDTO.getRole() == UserRole.MENTOR) {
    emailService.sendMentorRegistrationRequestToAdmin(savedUser);  // Email to admin
}
```

#### New `adminSendMentorVerificationCode()` Method
**Purpose:** Called when admin clicks the link in registration email

```java
@Transactional
public void adminSendMentorVerificationCode(String mentorEmail, String adminApprovalToken) {
    User user = userRepository.findByEmail(mentorEmail)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    // Verify admin approval token matches
    if (user.getAdminApprovalToken() == null || 
        !user.getAdminApprovalToken().equals(adminApprovalToken)) {
        throw new IllegalArgumentException("Invalid or expired approval token");
    }
    
    // Generate 6-digit code (NO EXPIRY)
    String verificationCode = String.format("%06d", new Random().nextInt(1000000));
    user.setVerificationCode(verificationCode);
    user.setRegistrationStatus("WAITING_FOR_CODE");
    userRepository.save(user);
    
    // Send code to mentor email
    emailService.sendMentorVerificationCode(user.getFullName(), user.getEmail(), verificationCode);
}
```

#### Modified `resendMentorVerificationCode()` Method
**Changes:**
- Removed 24-hour expiry logic
- Added check for `registrationStatus == "WAITING_FOR_CODE"`
- Mentor can only request resend after admin has sent initial code

```java
@Transactional
public void resendMentorVerificationCode(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    if (!user.getRegistrationStatus().equals("WAITING_FOR_CODE")) {
        throw new IllegalArgumentException("Wait for admin to send code first");
    }
    
    // Generate new code (NO EXPIRY)
    String verificationCode = String.format("%06d", new Random().nextInt(1000000));
    user.setVerificationCode(verificationCode);
    userRepository.save(user);
    
    emailService.sendMentorVerificationCode(user.getFullName(), user.getEmail(), verificationCode);
}
```

#### Modified `verifyMentorCode()` Method
**Changes:**
- REMOVED expiry check (no LocalDateTime comparison)
- REMOVED `user.setVerificationCodeExpiry(null)`
- Simplified to just validate code format

```java
@Transactional
public UserDTO verifyMentorCode(String email, String code) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    // NO EXPIRY CHECK - Code is valid forever
    if (user.getVerificationCode() == null || 
        !user.getVerificationCode().equals(code)) {
        throw new IllegalArgumentException("Invalid verification code");
    }
    
    // Mark as verified
    user.setIsVerified(true);
    user.setIsApproved(true);
    user.setRegistrationStatus("VERIFIED");
    user.setVerificationCode(null);  // Clear code after use
    user.setAdminApprovalToken(null);  // Clear admin token
    User savedUser = userRepository.save(user);
    
    syncMentorToMentorsCollection(savedUser);
    return convertToDTO(savedUser);
}
```

#### New `generateSecureToken()` Helper Method
```java
private String generateSecureToken() {
    return java.util.UUID.randomUUID().toString();
}
```

---

### 3. EmailService (`EmailService.java`)

#### New `sendMentorRegistrationRequestToAdmin()` Method
**Purpose:** Sends email to admin about new mentor registration with approval link

```java
public void sendMentorRegistrationRequestToAdmin(User mentor) {
    String subject = "🔔 New Mentor Registration Request - PlaceTrack Admin";
    String approvalLink = baseUrl + "/api/auth/admin/send-mentor-code?token=" 
        + mentor.getAdminApprovalToken() + "&email=" + mentor.getEmail();
    
    String text = "Dear Admin,\n\n" +
        "A new mentor has registered and is awaiting approval.\n\n" +
        "MENTOR DETAILS:\n" +
        "Name: " + mentor.getFullName() + "\n" +
        "Email: " + mentor.getEmail() + "\n" +
        "Company: " + mentor.getPlacedCompany() + "\n\n" +
        "SEND VERIFICATION CODE:\n" +
        "Click this link to send the mentor a verification code:\n" +
        approvalLink + "\n\n" +
        "Once you click, a code will be generated and sent to the mentor's email.";
    
    // Send to admin email from configuration
    if (mailSender != null) {
        // Send actual email
    } else {
        // Dev mode: print to console
        System.out.println("Approval Link: " + approvalLink);
    }
}
```

#### Modified `sendMentorVerificationCode()` Method
**Changes:**
- Updated message to indicate admin approval
- Removed "24 hours validity" message
- Added "Code does NOT expire" note

```java
public void sendMentorVerificationCode(String mentorName, String mentorEmail, String verificationCode) {
    String text = "Dear " + mentorName + ",\n\n" +
        "Your admin has approved your mentor registration and sent you a verification code.\n\n" +
        "YOUR 6-DIGIT CODE: " + verificationCode + "\n\n" +
        "HOW TO USE:\n" +
        "1. Log in with your email and password\n" +
        "2. Enter this code on the verification page\n" +
        "3. Access your mentor dashboard\n\n" +
        "NOTE: This code does NOT expire. You can use it anytime.\n\n" +
        "If you did not request this, please contact your admin.";
    
    // Send email
}
```

---

### 4. AuthController (`AuthController.java`)

#### Modified `sendMentorVerificationCode()` Endpoint (Student Resend)
**Endpoint:** `POST /api/auth/mentors/send-verification-code`
**Purpose:** Used by mentors on verification page to request code resend
**Request Body:** `{ "email": "mentor@gct.ac.in" }`
**Response:** `{ "success": true, "message": "Code sent" }`

#### New `adminSendMentorCode()` Endpoint
**Endpoint:** `GET /api/auth/admin/send-mentor-code?email=xxx&token=yyy`
**Purpose:** Called when admin clicks approval link in registration email
**Security:** Uses secure token that's only valid for that specific mentor
**Response:** HTML success page (can be clicked in email)

```java
@GetMapping("/admin/send-mentor-code")
public ResponseEntity<String> adminSendMentorCode(
    @RequestParam String email,
    @RequestParam String token) {
    try {
        authService.adminSendMentorVerificationCode(email, token);
        return ResponseEntity.ok(
            "<html><body>" +
            "<h1>✅ Verification Code Sent!</h1>" +
            "<p>The mentor will receive the code in their email shortly.</p>" +
            "</body></html>"
        );
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(
            "<html><body>" +
            "<h1>❌ Error: " + e.getMessage() + "</h1>" +
            "</body></html>"
        );
    }
}
```

---

## Frontend Changes

### 1. MentorVerificationCode Component (`MentorVerificationCode.js`)

**Removed:**
- `timeRemaining` state
- Timer countdown logic
- Code expiry timer display
- Expiry warning messages

**Added:**
- `codeReceived` state to track if mentor has received code
- "Waiting for admin approval" message
- Updated messaging about waiting for admin

**Key Changes:**
```javascript
// Show waiting message initially
{!codeReceived && (
    <div className="waiting-for-code-message">
        <p>⏳ Waiting for admin to send your verification code...</p>
        <p>Once the admin sends the code, you can enter it below.</p>
    </div>
)}

// Resend button renamed to "Request Code"
<button onClick={handleResendCode}>
    {resending ? "Requesting..." : "Request Code"}
</button>
```

**Updated Info Box:**
```javascript
<ul>
    <li>✓ Wait for your admin to send you the verification code</li>
    <li>✓ The code does NOT expire - you can use it anytime</li>
    <li>✓ After verification, you can access your mentor dashboard</li>
</ul>
```

---

### 2. VerificationCode CSS (`VerificationCode.css`)

**Removed:**
- `.verification-timer { }` - Removed entirely
- `@keyframes pulse` - Timer warning animation
- Timer-related styles and classes

**Added:**
```css
.waiting-for-code-message {
    padding: 20px;
    background: #fef3c7;
    border: 2px solid #fbbf24;
    border-radius: 12px;
    margin-bottom: 24px;
}

.waiting-for-code-message p {
    color: #92400e;
    font-weight: 600;
}

.resend-info {
    font-size: 12px;
    font-style: italic;
    color: #666;
    margin-top: 8px;
}
```

---

### 3. Login Component (`Login.js`)

**Updated Messages:**
```javascript
// For mentor login
if (response.data.user.role === "MENTOR") {
    toast.info("Please verify your account using the code sent by admin.");
    navigate("/mentor-verify", { state: { email: formData.email } });
}

// For mentor not verified error
if (error.response?.data?.message === "MENTOR_NOT_VERIFIED") {
    toast.info("Your account is pending admin verification. Please wait for the admin to send you a verification code.");
}
```

---

### 4. Register Component (`Register.js`)

**Updated Message:**
```javascript
if (selectedRole === "MENTOR") {
    toast.info("Your registration request has been sent to the admin. You'll receive a verification code once approved.");
    navigate("/mentor-verify", { state: { email: formData.email } });
}
```

---

### 5. MentorRegister Component (`MentorRegister.js`)

**Updated Message:**
```javascript
toast.success("Registration successful! Your request has been sent to the admin.");
navigate("/mentor-verify", { state: { email: formData.email } });
```

---

## Admin Email Example

When a mentor registers, admin receives:

```
Subject: 🔔 New Mentor Registration Request - PlaceTrack Admin

Dear Admin,

A new mentor has registered on GCT PlaceTrack and is awaiting approval.

═══════════════════════════════════════════════════════════
          MENTOR REGISTRATION DETAILS
═══════════════════════════════════════════════════════════

Name: John Doe
Email: john@example.com
Phone: 9876543210
Company: Microsoft
Position: Senior Software Engineer
Location: Bangalore

═══════════════════════════════════════════════════════════

SEND VERIFICATION CODE:
Click the link below to send a verification code to the mentor:
http://localhost:8080/api/auth/admin/send-mentor-code?token=abc123xyz&email=john@example.com

Once you click this link, a verification code will be generated and sent to 
the mentor's email. The mentor can then enter this code to access the platform.

═══════════════════════════════════════════════════════════

Best regards,
GCT Placement Cell
```

---

## Mentor Verification Code Email Example

When admin sends code, mentor receives:

```
Subject: 🔐 Your Mentor Verification Code - PlaceTrack

Dear John Doe,

Your admin has approved your mentor registration and sent you a verification code.

═══════════════════════════════════════════════════════════
          YOUR VERIFICATION CODE
═══════════════════════════════════════════════════════════

Your 6-digit verification code is: 347291

═══════════════════════════════════════════════════════════

HOW TO USE:
1. Go to the Placement Tracker application
2. Log in with your email and password
3. You will be prompted to enter your verification code
4. Enter the code above (6 digits)
5. Once verified, you can access your mentor dashboard

NOTE: Keep this code safe. You can use it whenever you want to verify your account.
The code does NOT expire.

═══════════════════════════════════════════════════════════

If you did not request this, please contact your admin.

Best regards,
GCT Placement Cell
```

---

## Database Schema Changes

### User Collection

**Old Fields (Removed):**
```javascript
{
    approvalToken: "old_token_value",           // REMOVED
    verificationCodeExpiry: ISODate(...),       // REMOVED
}
```

**New Fields (Added):**
```javascript
{
    registrationStatus: "REGISTERED",           // NEW - tracks approval stage
    adminApprovalToken: "secure-uuid-token",   // NEW - for email link verification
}
```

**Existing Fields (Modified Behavior):**
```javascript
{
    isVerified: false,                          // Changed: true only after code verification
    isApproved: false,                          // Changed: true only after isVerified = true
    verificationCode: null,                     // Changed: only set when admin sends code
}
```

**Migration Notes:**
- Old `approvalToken` field can be safely dropped
- Old `verificationCodeExpiry` field can be safely dropped
- Set default `registrationStatus = "REGISTERED"` for existing mentors
- No data loss from existing records

---

## Key Differences from Previous System

| Feature | Old System | New System |
|---------|-----------|-----------|
| **Code Generation** | Auto on registration | On admin approval |
| **Code Expiry** | 24 hours | Never expires |
| **Email Sent To** | Mentor first | Admin first |
| **Admin Action** | Email link in mentor email | Email link in admin email |
| **Mentor Experience** | Immediate code entry | Wait for admin approval |
| **Status Field** | isApproved | registrationStatus + isVerified |
| **Admin Control** | Limited | Full control over when to send |

---

## Testing Scenarios

### Scenario 1: Normal Mentor Registration & Verification
1. Mentor registers → Email sent to admin
2. Admin clicks link → Email sent to mentor with code
3. Mentor enters code → Access granted
4. ✅ Expected: Mentor can login and access dashboard

### Scenario 2: Mentor Requests Code Resend
1. Mentor on verification page clicks "Request Code"
2. New code generated and sent to mentor
3. Mentor enters new code → Access granted
4. ✅ Expected: Old code no longer works, new code works

### Scenario 3: Mentor with No Code
1. Mentor tries to login → Password correct but not verified
2. System redirects to verification page
3. Page shows "Waiting for admin to send code"
4. ✅ Expected: Cannot proceed until code verified

### Scenario 4: Code Does Not Expire
1. Mentor receives code
2. Waits 30 days (or more)
3. Enters code → Still works
4. ✅ Expected: Code validity is infinite

---

## Configuration

### Email Configuration
- **Dev Mode:** Codes printed to console (no email needed)
- **Production Mode:** Requires `mail.smtp.host` configured in `application.properties`
- **Admin Email:** Configured in `app.admin.email` property

### Application Properties
```properties
app.admin.email=harshavardhinin6@gmail.com
app.base.url=http://localhost:8080
```

---

## Security Considerations

1. **Admin Approval Token**
   - Unique UUID per mentor registration
   - Single-use (cleared after admin sends code)
   - Cannot be guessed (128-bit random)

2. **Verification Code**
   - 6-digit numeric code
   - Not transmitted in URLs (only in email)
   - Can be re-used indefinitely
   - Admin must have email access to approve

3. **No Expiry Risk**
   - Codes valid forever means lower security but higher usability
   - Consider adding code change option in future
   - Rate limiting recommended on verification attempts

---

## Deployment Checklist

- [ ] Compile backend: `mvn clean compile`
- [ ] Run migration to add new fields to existing mentors
- [ ] Restart Spring Boot backend
- [ ] Build frontend: `npm run build`
- [ ] Restart React frontend
- [ ] Test mentor registration flow
- [ ] Verify admin email received with link
- [ ] Test admin approval link click
- [ ] Test mentor code entry and verification
- [ ] Test mentor login with verified account

---

## Rollback Plan (if needed)

1. Revert User.java to include `verificationCodeExpiry` field
2. Revert AuthService registration to generate code immediately
3. Revert AuthService to use expiry check in `verifyMentorCode()`
4. Revert EmailService to send code immediately to mentor
5. Delete new AuthController endpoint `adminSendMentorCode()`
6. Revert frontend components to show countdown timer
7. Revert MentorVerificationCode.js to use timer logic

---

## Summary

The new system shifts control from automatic code generation to admin-driven approval, making it:
- **More controlled:** Admins decide when to approve registrations
- **More flexible:** Codes never expire, mentors can use them anytime
- **More transparent:** Mentors know they're waiting for admin approval
- **More user-friendly:** No time pressure or code expiry stress

Admin workflow is simple: register mentor → receive email → click link → code sent → done!
