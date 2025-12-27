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
}
