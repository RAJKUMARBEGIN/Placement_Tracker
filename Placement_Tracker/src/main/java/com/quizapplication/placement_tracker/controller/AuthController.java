package com.quizapplication.placement_tracker.controller;

import com.quizapplication.placement_tracker.dto.*;
import com.quizapplication.placement_tracker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user registration and login")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}
