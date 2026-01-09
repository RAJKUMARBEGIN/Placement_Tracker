package com.quizapplication.placement_tracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
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
                System.err.println("Failed to send email: " + e.getMessage());
                // For development, still return OTP
                System.out.println("DEV MODE - OTP for " + email + ": " + otp);
                return otp;
            }
        } else {
            // Development mode - email not configured
            System.out.println("DEV MODE - OTP for " + email + ": " + otp);
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
        
        String subject = "🎓 New Mentor Registration - Approval Required | PlaceTrack";
        String text = "Dear Admin,\n\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "          NEW MENTOR REGISTRATION - APPROVAL REQUIRED\n" +
                "═══════════════════════════════════════════════════════════\n\n" +
                "A new mentor has registered on GCT PlaceTrack and is awaiting your approval.\n\n" +
                "📋 MENTOR DETAILS:\n" +
                "─────────────────────────────────────────────────────────────\n" +
                "👤 Full Name:        " + mentorName + "\n" +
                "📧 Email:            " + mentorEmail + "\n" +
                "🏢 Company:          " + (company != null ? company : "Not specified") + "\n" +
                "💼 Position:         " + (position != null ? position : "Not specified") + "\n" +
                "🎓 Department:       " + (departmentName != null ? departmentName : "Not specified") + "\n" +
                "📞 Phone:            " + (phoneNumber != null ? phoneNumber : "Not provided") + "\n" +
                "🔗 LinkedIn:         " + (linkedinProfile != null ? linkedinProfile : "Not provided") + "\n" +
                "📅 Graduation Year:  " + (graduationYear != null ? graduationYear.toString() : "Not specified") + "\n" +
                "📅 Placement Year:   " + (placementYear != null ? placementYear.toString() : "Not specified") + "\n" +
                "🔒 Contact Visibility: " + (contactVisibility != null ? contactVisibility : "PUBLIC") + "\n" +
                "─────────────────────────────────────────────────────────────\n\n" +
                "📌 ACTIONS:\n\n" +
                "✅ APPROVE this mentor:\n" +
                approveLink + "\n\n" +
                "❌ REJECT this mentor:\n" +
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
                System.out.println("Mentor registration notification with approve link sent to: " + adminEmail);
            } catch (Exception e) {
                System.err.println("Failed to send mentor registration notification: " + e.getMessage());
            }
        } else {
            System.out.println("DEV MODE - Mentor Registration Notification:");
            System.out.println("To: " + adminEmail);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + text);
        }
    }

    /**
     * Send notification to mentor when their account is approved
     */
    public void sendMentorApprovalNotification(String mentorEmail, String mentorName) {
        String subject = "Your Mentor Account has been Approved - PlaceTrack";
        String text = "Dear " + mentorName + ",\n\n" +
                "Congratulations! Your mentor account on GCT PlaceTrack has been approved.\n\n" +
                "You can now log in and your profile will be visible to students " +
                "who are seeking guidance for their placement journey.\n\n" +
                "Thank you for being a mentor and helping our students!\n\n" +
                "Best regards,\n" +
                "GCT Placement Cell";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(mentorEmail);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                System.out.println("Mentor approval notification sent to: " + mentorEmail);
            } catch (Exception e) {
                System.err.println("Failed to send mentor approval notification: " + e.getMessage());
            }
        } else {
            System.out.println("DEV MODE - Mentor Approval Notification:");
            System.out.println("To: " + mentorEmail);
            System.out.println("Subject: " + subject);
        }
    }
}
