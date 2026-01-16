package com.quizapplication.placement_tracker.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.gct.email.domain:gct.ac.in}")
    private String gctEmailDomain;

    @Value("${app.admin.email:harshavardhinin6@gmail.com}")
    private String adminEmail;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    // Store OTPs with expiry (email -> OTP)
    private final Map<String, OTPData> otpStore = new ConcurrentHashMap<>();

    private static class OTPData {
        String otp;
        long expiryTime;

        OTPData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    /**
     * Check if email is a GCT email
     */
    public boolean isGCTEmail(String email) {
        if (email == null) return false;
        return email.toLowerCase().endsWith("@" + gctEmailDomain);
    }

    /**
     * Generate a 6-digit OTP
     */
    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Send OTP to email - returns OTP for dev mode display
     */
    public String sendOTP(String email) {
        if (!isGCTEmail(email)) {
            return null;
        }

        String otp = generateOTP();
        
        // Store OTP with 10 minutes expiry
        otpStore.put(email.toLowerCase(), new OTPData(otp, System.currentTimeMillis() + 600000));

        // Try to send email, if mail sender is configured
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("GCT PlaceTrack - Email Verification OTP");
                message.setText("Dear Student,\n\n" +
                        "Your OTP for GCT PlaceTrack registration is: " + otp + "\n\n" +
                        "This OTP is valid for 10 minutes.\n\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "GCT Placement Cell");
                mailSender.send(message);
                return otp; // Return OTP for dev display
            } catch (Exception e) {
                log.error("Failed to send email: {}", e.getMessage());
                // For development, still return OTP
                log.info("DEV MODE - OTP for {}: {}", email, otp);
                return otp;
            }
        } else {
            // Development mode - email not configured
            log.info("DEV MODE - OTP for {}: {}", email, otp);
            return otp;
        }
    }

    /**
     * Verify OTP
     */
    public boolean verifyOTP(String email, String otp) {
        if (email == null || otp == null) return false;
        
        OTPData data = otpStore.get(email.toLowerCase());
        if (data == null) {
            return false;
        }

        // Check expiry
        if (System.currentTimeMillis() > data.expiryTime) {
            otpStore.remove(email.toLowerCase());
            return false;
        }

        // Check OTP match
        if (data.otp.equals(otp)) {
            otpStore.remove(email.toLowerCase()); // Remove after successful verification
            return true;
        }

        return false;
    }

    /**
     * Clear expired OTPs (can be called periodically)
     */
    public void clearExpiredOTPs() {
        long now = System.currentTimeMillis();
        otpStore.entrySet().removeIf(entry -> entry.getValue().expiryTime < now);
    }

    /**
     * Send notification to admin when a new mentor registers with approve link
     */
    public void sendMentorRegistrationNotification(String mentorName, String mentorEmail, 
            String company, String position, String departmentName, String phoneNumber,
            String linkedinProfile, Integer graduationYear, Integer placementYear,
            String contactVisibility, String approvalToken) {
        
        String approveLink = baseUrl + "/api/auth/mentors/approve-via-email?token=" + approvalToken;
        String rejectLink = baseUrl + "/api/auth/mentors/reject-via-email?token=" + approvalToken;
        
        String subject = "New Mentor Registration - Approval Required | PlaceTrack";
        String text = "Dear Admin,\n\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "          NEW MENTOR REGISTRATION - APPROVAL REQUIRED\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "A new mentor has registered on GCT PlaceTrack and is awaiting your approval.\n\n" +
                "MENTOR DETAILS:\n" +
                "─────────────────────────────────────────────────────────────\n" +
                "Full Name:        " + mentorName + "\n" +
                "Email:            " + mentorEmail + "\n" +
                "Company:          " + (company != null ? company : "Not specified") + "\n" +
                "Position:         " + (position != null ? position : "Not specified") + "\n" +
                "Department:       " + (departmentName != null ? departmentName : "Not specified") + "\n" +
                "Phone:            " + (phoneNumber != null ? phoneNumber : "Not provided") + "\n" +
                "LinkedIn:         " + (linkedinProfile != null ? linkedinProfile : "Not provided") + "\n" +
                "Graduation Year:  " + (graduationYear != null ? graduationYear.toString() : "Not specified") + "\n" +
                "Placement Year:   " + (placementYear != null ? placementYear.toString() : "Not specified") + "\n" +
                "Contact Visibility: " + (contactVisibility != null ? contactVisibility : "PUBLIC") + "\n" +
                "─────────────────────────────────────────────────────────────\n\n" +
                "ACTIONS:\n\n" +
                "[APPROVE] this mentor:\n" +
                approveLink + "\n\n" +
                "[REJECT] this mentor:\n" +
                rejectLink + "\n\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "NOTE: You can also manage this request from the Admin Dashboard.\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "Best regards,\n" +
                "GCT PlaceTrack System";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(adminEmail);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                log.info("Mentor registration notification with approve link sent to: {}", adminEmail);
            } catch (Exception e) {
                log.error("Failed to send mentor registration notification: {}", e.getMessage());
            }
        } else {
            log.info("DEV MODE - Mentor Registration Notification:");
            log.info("To: {}", adminEmail);
            log.info("Subject: {}", subject);
            log.debug("Body: {}", text);
        }
    }

    /**
     * Send mentor approval notification with login credentials
     */
    public void sendMentorApprovalNotification(String mentorEmail, String mentorName, String password) {
        String subject = "Account Approved - GCT PlaceTrack";
        String text = "Dear " + mentorName + ",\n\n" +
                "Congratulations! Your mentor account has been successfully authenticated by the admin.\n\n" +
                "You can now sign in to GCT PlaceTrack using your email and password.\n\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "YOUR LOGIN CREDENTIALS:\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "Email:    " + mentorEmail + "\n" +
                "Password: " + password + "\n\n" +
                "Login at: http://localhost:3000/login\n\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "You can now:\n" +
                "- Access your mentor dashboard\n" +
                "- Share your placement experiences\n" +
                "- Help guide junior students\n\n" +
                "Best regards,\n" +
                "GCT Placement Cell";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(mentorEmail);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                log.info("Mentor approval notification sent to: {}", mentorEmail);
            } catch (Exception e) {
                log.error("Failed to send mentor approval notification: {}", e.getMessage());
            }
        } else {
            log.info("DEV MODE - Mentor Approval Notification:");
            log.info("To: {}", mentorEmail);
            log.info("Subject: {}", subject);
            log.warn("Password: {}", password);
        }
    }

    /**
     * Send mentor rejection notification
     */
    public void sendMentorRejectionNotification(String mentorEmail, String mentorName) {
        String subject = "Mentor Registration Update - PlaceTrack";
        String text = "Dear " + mentorName + ",\n\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "          MENTOR REGISTRATION UPDATE\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "We regret to inform you that your mentor registration on GCT PlaceTrack\n" +
                "has not been approved at this time.\n\n" +
                "This could be due to one of the following reasons:\n" +
                "• LinkedIn profile not provided or invalid\n" +
                "• Incomplete information\n" +
                "• Unable to verify placement details\n\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "If you believe this was an error, please contact the admin at:\n" +
                "📧 " + adminEmail + "\n\n" +
                "You may also try registering again with complete and accurate information.\n\n" +
                "Best regards,\n" +
                "GCT Placement Cell";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(mentorEmail);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                log.info("Mentor rejection notification sent to: {}", mentorEmail);
            } catch (Exception e) {
                log.error("Failed to send mentor rejection notification: {}", e.getMessage());
            }
        } else {
            log.info("DEV MODE - Mentor Rejection Notification:");
            log.info("To: {}", mentorEmail);
            log.info("Subject: {}", subject);
        }
    }

    /**
     * Send mentor registration request to admin for approval
     * Includes ALL mentor details for admin to review
     */
    public void sendMentorRegistrationRequestToAdmin(com.quizapplication.placement_tracker.entity.User mentor) {
        String subject = "New Mentor Registration - Approval Required | " + mentor.getFullName();
        String mentorEmail = mentor.getEmail();
        String mentorName = mentor.getFullName();
        String mentorPhone = mentor.getPhoneNumber() != null ? mentor.getPhoneNumber() : "Not provided";
        String mentorLinkedIn = mentor.getLinkedinProfile() != null ? mentor.getLinkedinProfile() : "NOT PROVIDED";
        
        String text = "Dear Admin,\n\n" +
                "A new mentor has registered on GCT PlaceTrack and requires your approval.\n\n" +
                "═══════════════════════════════════════════════════════════════════════\n" +
                "                     MENTOR REGISTRATION DETAILS\n" +
                "═══════════════════════════════════════════════════════════════════════\n\n" +
                "★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★\n" +
                "🔗 LINKEDIN PROFILE (MANDATORY):\n" +
                "   " + mentorLinkedIn + "\n" +
                "★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★\n\n" +
                "👤 PERSONAL INFORMATION:\n" +
                "─────────────────────────────────────────────────────────────────────────\n" +
                "   Full Name:           " + mentorName + "\n" +
                "   Email:               " + mentorEmail + "\n" +
                "   Phone Number:        " + mentorPhone + "\n\n" +
                "🏢 PLACEMENT INFORMATION:\n" +
                "─────────────────────────────────────────────────────────────────────────\n" +
                "   Company:             " + (mentor.getPlacedCompany() != null ? mentor.getPlacedCompany() : "Not provided") + "\n" +
                "   Position:            " + (mentor.getPlacedPosition() != null ? mentor.getPlacedPosition() : "Not provided") + "\n" +
                "   Placement Year:      " + (mentor.getPlacementYear() != null ? mentor.getPlacementYear().toString() : "Not provided") + "\n\n" +
                "🎓 ACADEMIC INFORMATION:\n" +
                "─────────────────────────────────────────────────────────────────────────\n" +
                "   Department ID:       " + (mentor.getDepartmentId() != null ? mentor.getDepartmentId() : "Not provided") + "\n" +
                "   Graduation Year:     " + (mentor.getGraduationYear() != null ? mentor.getGraduationYear().toString() : "Not provided") + "\n\n" +
                "🔒 PRIVACY SETTINGS:\n" +
                "─────────────────────────────────────────────────────────────────────────\n" +
                "   Contact Visibility:  " + (mentor.getContactVisibility() != null ? mentor.getContactVisibility() : "PUBLIC") + "\n\n" +
                "═══════════════════════════════════════════════════════════════════════\n\n" +
                "⚠️ IMPORTANT NOTES:\n" +
                "• LinkedIn profile is MANDATORY - verify before approving\n" +
                "• Upon approval, mentor will receive login credentials via email\n" +
                "• Upon rejection, mentor will be notified via email\n\n" +
                "═══════════════════════════════════════════════════════════════════════\n\n" +
                "📋 ACTION REQUIRED:\n\n" +
                "Please log in to the Admin Dashboard to APPROVE or REJECT this mentor:\n" +
                "🔗 Dashboard: http://localhost:3000/admin-dashboard\n\n" +
                "═══════════════════════════════════════════════════════════════════════\n\n" +
                "Best regards,\n" +
                "GCT PlaceTrack System";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(adminEmail);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                log.info("Mentor registration request sent to admin: {}", adminEmail);
            } catch (Exception e) {
                log.error("Failed to send mentor registration request to admin: {}", e.getMessage());
            }
        } else {
            // Development mode - email not configured
            log.info("DEV MODE - Mentor Registration Request for Admin:");
            log.info("To: {}", adminEmail);
            log.info("Subject: {}", subject);
            log.info("LinkedIn: {}", mentorLinkedIn);
        }
    }

    /**
     * Send verification code to mentor email
     */
    public void sendMentorVerificationCode(String mentorName, String mentorEmail, String verificationCode) {
        String subject = "Your Mentor Verification Code - PlaceTrack";
        String text = "Dear " + mentorName + ",\n\n" +
                "Your admin has approved your mentor registration and sent you a verification code.\n\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "          YOUR VERIFICATION CODE\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "Your 6-digit verification code is: " + verificationCode + "\n\n" +
                "HOW TO USE:\n" +
                "1. Go to the Placement Tracker application\n" +
                "2. Log in with your email and password\n" +
                "3. You will be prompted to enter your verification code\n" +
                "4. Enter the code above (6 digits)\n" +
                "5. Once verified, you can access your mentor dashboard\n\n" +
                "Note: Keep this code safe. You can use it whenever you want to verify your account.\n" +
                "The code does NOT expire.\n\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "If you did not request this, please contact your admin.\n\n" +
                "Best regards,\n" +
                "GCT Placement Cell";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(mentorEmail);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                log.info("Mentor verification code sent to: {}", mentorEmail);
            } catch (Exception e) {
                log.error("Failed to send mentor verification code: {}", e.getMessage());
                log.info("DEV MODE - Verification Code for {}: {}", mentorEmail, verificationCode);
            }
        } else {
            // Development mode - email not configured
            log.info("DEV MODE - Mentor Verification Code for {}: {}", mentorEmail, verificationCode);
        }
    }
}
