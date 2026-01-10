package com.quizapplication.placement_tracker.controller;

import com.quizapplication.placement_tracker.dto.*;
import com.quizapplication.placement_tracker.service.AuthService;
import com.quizapplication.placement_tracker.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user registration and login")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    public AuthController(AuthService authService, EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP to GCT email", description = "Send verification OTP to a GCT email address")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "OTP sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid email or not a GCT email")
    })
    public ResponseEntity<Map<String, Object>> sendOTP(@RequestBody SendOTPDTO sendOTPDTO) {
        Map<String, Object> response = new HashMap<>();
        
        String email = sendOTPDTO.getEmail();
        
        // Check if it's a GCT email
        if (!emailService.isGCTEmail(email)) {
            response.put("success", false);
            response.put("message", "Only GCT email addresses (@gct.ac.in) are allowed");
            response.put("isGCTEmail", false);
            return ResponseEntity.badRequest().body(response);
        }
        
        // Send OTP
        String otp = emailService.sendOTP(email);
        if (otp != null) {
            response.put("success", true);
            response.put("message", "OTP sent to your email!");
            response.put("isGCTEmail", true);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Failed to send OTP. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP", description = "Verify the OTP sent to email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "OTP verified successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired OTP")
    })
    public ResponseEntity<Map<String, Object>> verifyOTP(@RequestBody VerifyOTPDTO verifyOTPDTO) {
        Map<String, Object> response = new HashMap<>();
        
        boolean verified = emailService.verifyOTP(verifyOTPDTO.getEmail(), verifyOTPDTO.getOtp());
        
        if (verified) {
            response.put("success", true);
            response.put("message", "Email verified successfully");
            response.put("verified", true);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP. Please try again.");
            response.put("verified", false);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check-gct-email")
    @Operation(summary = "Check if email is GCT email", description = "Check if the provided email is from GCT domain")
    public ResponseEntity<Map<String, Object>> checkGCTEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        boolean isGCT = emailService.isGCTEmail(email);
        response.put("isGCTEmail", isGCT);
        response.put("email", email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Register as a student or mentor. Only @gct.ac.in emails are allowed.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Registration successful"),
            @ApiResponse(responseCode = "400", description = "Invalid input or email not from gct.ac.in"),
            @ApiResponse(responseCode = "409", description = "User already exists")
    })
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        AuthResponseDTO response = authService.register(registerDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Login with email and password")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        AuthResponseDTO response = authService.login(loginDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve user details by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDTO> getUserById(
            @Parameter(description = "User ID") @PathVariable String id) {
        UserDTO user = authService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/user/{id}/profile")
    @Operation(summary = "Update user profile", description = "Update user profile information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDTO> updateUserProfile(
            @Parameter(description = "User ID") @PathVariable String id,
            @RequestBody UpdateProfileDTO updateProfileDTO) {
        UserDTO updatedUser = authService.updateUserProfile(id, updateProfileDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/mentors")
    @Operation(summary = "Get all approved mentors", description = "Retrieve list of all approved mentors (for public display)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors list")
    public ResponseEntity<List<UserDTO>> getAllMentors() {
        List<UserDTO> mentors = authService.getApprovedMentors();
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/mentors/pending")
    @Operation(summary = "Get pending mentors", description = "Retrieve list of mentors awaiting approval (admin only)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved pending mentors list")
    public ResponseEntity<List<UserDTO>> getPendingMentors() {
        List<UserDTO> mentors = authService.getPendingMentors();
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/mentors/all")
    @Operation(summary = "Get all mentors including pending", description = "Retrieve all mentors regardless of approval status (admin only)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all mentors")
    public ResponseEntity<List<UserDTO>> getAllMentorsIncludingPending() {
        List<UserDTO> mentors = authService.getAllMentors();
        return ResponseEntity.ok(mentors);
    }

    @PutMapping("/mentors/{id}/approve")
    @Operation(summary = "Approve mentor", description = "Approve a pending mentor (admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mentor approved successfully"),
            @ApiResponse(responseCode = "404", description = "Mentor not found"),
            @ApiResponse(responseCode = "400", description = "User is not a mentor")
    })
    public ResponseEntity<UserDTO> approveMentor(
            @Parameter(description = "Mentor ID") @PathVariable String id) {
        UserDTO approvedMentor = authService.approveMentor(id);
        return ResponseEntity.ok(approvedMentor);
    }

    @DeleteMapping("/mentors/{id}/reject")
    @Operation(summary = "Reject mentor", description = "Reject and remove a pending mentor (admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Mentor rejected and removed"),
            @ApiResponse(responseCode = "404", description = "Mentor not found"),
            @ApiResponse(responseCode = "400", description = "User is not a mentor")
    })
    public ResponseEntity<Void> rejectMentor(
            @Parameter(description = "Mentor ID") @PathVariable String id) {
        authService.rejectMentor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mentors/department/{departmentId}")
    @Operation(summary = "Get mentors by department", description = "Retrieve mentors for a specific department")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<List<UserDTO>> getMentorsByDepartment(
            @Parameter(description = "Department ID") @PathVariable String departmentId) {
        List<UserDTO> mentors = authService.getMentorsByDepartment(departmentId);
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/mentors/company")
    @Operation(summary = "Get mentors by company", description = "Search mentors placed in a specific company")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors")
    public ResponseEntity<List<UserDTO>> getMentorsByCompany(
            @Parameter(description = "Company name") @RequestParam String companyName) {
        List<UserDTO> mentors = authService.getMentorsByCompany(companyName);
        return ResponseEntity.ok(mentors);
    }

    @PutMapping("/user/{id}")
    @Operation(summary = "Update user profile", description = "Update user details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDTO> updateUser(
            @Parameter(description = "User ID") @PathVariable String id,
            @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = authService.updateUser(id, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/user/{id}/convert-to-mentor")
    @Operation(summary = "Convert student to mentor", description = "Convert a placed and graduated student to a mentor")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully converted to mentor"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "400", description = "User is not eligible to become mentor")
    })
    public ResponseEntity<UserDTO> convertToMentor(
            @Parameter(description = "User ID") @PathVariable String id,
            @RequestBody ConvertToMentorDTO convertDTO) {
        UserDTO updatedUser = authService.convertToMentor(id, convertDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Send OTP to user's email for password reset")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "OTP sent successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<String> forgotPassword(
            @Parameter(description = "Email address") @RequestBody ForgotPasswordDTO forgotPasswordDTO) {
        authService.sendPasswordResetOTP(forgotPasswordDTO.getEmail());
        return ResponseEntity.ok("OTP sent to your email successfully");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with OTP", description = "Verify OTP and reset user password")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password reset successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid OTP or password validation failed"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<String> resetPassword(
            @Parameter(description = "Reset password details") @RequestBody ResetPasswordDTO resetPasswordDTO) {
        authService.resetPassword(resetPasswordDTO);
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/mentors/send-verification-code")
    @Operation(summary = "Send verification code to mentor", description = "Send a verification code to mentor's email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification code sent successfully"),
            @ApiResponse(responseCode = "404", description = "Mentor not found")
    })
    public ResponseEntity<Map<String, Object>> sendMentorVerificationCode(@RequestBody SendMentorVerificationCodeDTO sendCodeDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            authService.resendMentorVerificationCode(sendCodeDTO.getEmail());
            response.put("success", true);
            response.put("message", "Verification code sent to your email");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/send-mentor-code")
    @Operation(summary = "Admin sends verification code to mentor", description = "Admin endpoint to send verification code via email link")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification code sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid token or request"),
            @ApiResponse(responseCode = "404", description = "Mentor not found")
    })
    public ResponseEntity<String> adminSendMentorCode(
            @RequestParam String email,
            @RequestParam String token) {
        try {
            authService.adminSendMentorVerificationCode(email, token);
            return ResponseEntity.ok(
                "<html><body style='font-family: Arial; text-align: center; padding: 50px;'>" +
                "<h1 style='color: #22c55e;'>✅ Verification Code Sent Successfully!</h1>" +
                "<p>A verification code has been sent to the mentor's email address.</p>" +
                "<p>The mentor can now log in and enter this code to access their dashboard.</p>" +
                "<a href='http://localhost:3000' style='display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;'>Go to PlaceTrack</a>" +
                "</body></html>"
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                "<html><body style='font-family: Arial; text-align: center; padding: 50px;'>" +
                "<h1 style='color: #ef4444;'>❌ Failed to Send Verification Code</h1>" +
                "<p>" + e.getMessage() + "</p>" +
                "<a href='http://localhost:3000' style='display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;'>Go to PlaceTrack</a>" +
                "</body></html>"
            );
        }
    }

    @PostMapping("/mentors/verify-code")
    @Operation(summary = "Verify mentor code", description = "Verify the code sent to mentor's email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Code verified successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired code")
    })
    public ResponseEntity<Map<String, Object>> verifyMentorCode(@RequestBody VerifyMentorCodeDTO verifyCodeDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDTO user = authService.verifyMentorCode(verifyCodeDTO.getEmail(), verifyCodeDTO.getVerificationCode());
            response.put("success", true);
            response.put("message", "Email verified successfully");
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/mentors/approve-via-email")
    @Operation(summary = "Approve mentor via email link", description = "Approve a mentor using the token sent in email")
    public ResponseEntity<String> approveMentorViaEmail(@RequestParam String token) {
        try {
            authService.approveMentorViaToken(token);
            return ResponseEntity.ok(
                "<html><body style='font-family: Arial; text-align: center; padding: 50px;'>" +
                "<h1 style='color: #22c55e;'>✅ Mentor Approved Successfully!</h1>" +
                "<p>The mentor has been approved and notified via email.</p>" +
                "<p>Their profile is now visible on the PlaceTrack application.</p>" +
                "<a href='http://localhost:3000' style='display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;'>Go to PlaceTrack</a>" +
                "</body></html>"
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                "<html><body style='font-family: Arial; text-align: center; padding: 50px;'>" +
                "<h1 style='color: #ef4444;'>❌ Approval Failed</h1>" +
                "<p>" + e.getMessage() + "</p>" +
                "</body></html>"
            );
        }
    }

    @GetMapping("/mentors/reject-via-email")
    @Operation(summary = "Reject mentor via email link", description = "Reject and delete a mentor using the token sent in email")
    public ResponseEntity<String> rejectMentorViaEmail(@RequestParam String token) {
        try {
            authService.rejectMentorViaToken(token);
            return ResponseEntity.ok(
                "<html><body style='font-family: Arial; text-align: center; padding: 50px;'>" +
                "<h1 style='color: #f59e0b;'>🚫 Mentor Rejected</h1>" +
                "<p>The mentor application has been rejected and their account has been removed.</p>" +
                "<a href='http://localhost:3000' style='display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;'>Go to PlaceTrack</a>" +
                "</body></html>"
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                "<html><body style='font-family: Arial; text-align: center; padding: 50px;'>" +
                "<h1 style='color: #ef4444;'>❌ Rejection Failed</h1>" +
                "<p>" + e.getMessage() + "</p>" +
                "</body></html>"
            );
        }
    }
}
