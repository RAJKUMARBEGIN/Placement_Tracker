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
            @Parameter(description = "User ID") @PathVariable Long id) {
        UserDTO user = authService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/mentors")
    @Operation(summary = "Get all mentors", description = "Retrieve list of all registered mentors")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors list")
    public ResponseEntity<List<UserDTO>> getAllMentors() {
        List<UserDTO> mentors = authService.getAllMentors();
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/mentors/department/{departmentId}")
    @Operation(summary = "Get mentors by department", description = "Retrieve mentors for a specific department")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<List<UserDTO>> getMentorsByDepartment(
            @Parameter(description = "Department ID") @PathVariable Long departmentId) {
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
            @Parameter(description = "User ID") @PathVariable Long id,
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
            @Parameter(description = "User ID") @PathVariable Long id,
            @RequestBody ConvertToMentorDTO convertDTO) {
        UserDTO updatedUser = authService.convertToMentor(id, convertDTO);
        return ResponseEntity.ok(updatedUser);
    }
}
