package com.quizapplication.placement_tracker.controller;

import com.quizapplication.placement_tracker.dto.*;
import com.quizapplication.placement_tracker.service.AdminService;
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
@RequestMapping("/api/admin")
@Tag(name = "Admin Management", description = "APIs for admin operations and mentor management")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    @Operation(summary = "Admin login", description = "Login with admin username and password")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "404", description = "Admin not found")
    })
    public ResponseEntity<AdminDTO> login(@Valid @RequestBody AdminLoginDTO loginDTO) {
        AdminDTO admin = adminService.login(loginDTO);
        return ResponseEntity.ok(admin);
    }

    @PostMapping("/create")
    @Operation(summary = "Create new admin", description = "Create a new admin account (only existing admin can do this)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Admin created successfully"),
            @ApiResponse(responseCode = "409", description = "Username or email already exists")
    })
    public ResponseEntity<AdminDTO> createAdmin(@Valid @RequestBody CreateAdminDTO createAdminDTO) {
        AdminDTO admin = adminService.createAdmin(createAdminDTO);
        return new ResponseEntity<>(admin, HttpStatus.CREATED);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset admin password", description = "Reset password for admin account (for development/recovery)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password reset successful"),
            @ApiResponse(responseCode = "404", description = "Admin not found")
    })
    public ResponseEntity<String> resetPassword(
            @RequestParam String username, 
            @RequestParam String newPassword) {
        adminService.resetAdminPassword(username, newPassword);
        return ResponseEntity.ok("Password reset successful for user: " + username);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get admin by ID", description = "Retrieve admin details by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Admin found"),
            @ApiResponse(responseCode = "404", description = "Admin not found")
    })
    public ResponseEntity<AdminDTO> getAdminById(
            @Parameter(description = "Admin ID") @PathVariable String id) {
        AdminDTO admin = adminService.getAdminById(id);
        return ResponseEntity.ok(admin);
    }

    // Mentor Management APIs
    @PostMapping("/mentors")
    @Operation(summary = "Create mentor", description = "Create a new mentor with assigned departments")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Mentor created successfully"),
            @ApiResponse(responseCode = "409", description = "Mentor with this email already exists"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<MentorDTO> createMentor(@Valid @RequestBody CreateMentorDTO createMentorDTO) {
        MentorDTO mentor = adminService.createMentor(createMentorDTO);
        return new ResponseEntity<>(mentor, HttpStatus.CREATED);
    }

    @PutMapping("/mentors/{id}")
    @Operation(summary = "Update mentor", description = "Update mentor details and assigned departments")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mentor updated successfully"),
            @ApiResponse(responseCode = "404", description = "Mentor not found"),
            @ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<MentorDTO> updateMentor(
            @Parameter(description = "Mentor ID") @PathVariable String id,
            @Valid @RequestBody CreateMentorDTO updateDTO) {
        MentorDTO mentor = adminService.updateMentor(id, updateDTO);
        return ResponseEntity.ok(mentor);
    }

    @DeleteMapping("/mentors/{id}")
    @Operation(summary = "Delete mentor", description = "Delete a mentor by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Mentor deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Mentor not found")
    })
    public ResponseEntity<Void> deleteMentor(
            @Parameter(description = "Mentor ID") @PathVariable String id) {
        adminService.deleteMentor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mentors")
    @Operation(summary = "Get all mentors", description = "Retrieve list of all active mentors")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors list")
    public ResponseEntity<List<MentorDTO>> getAllMentors() {
        List<MentorDTO> mentors = adminService.getAllMentors();
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/mentors/{id}")
    @Operation(summary = "Get mentor by ID", description = "Retrieve mentor details by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mentor found"),
            @ApiResponse(responseCode = "404", description = "Mentor not found")
    })
    public ResponseEntity<MentorDTO> getMentorById(
            @Parameter(description = "Mentor ID") @PathVariable String id) {
        MentorDTO mentor = adminService.getMentorById(id);
        return ResponseEntity.ok(mentor);
    }

    @GetMapping("/mentors/department/{departmentId}")
    @Operation(summary = "Get mentors by department", description = "Retrieve mentors assigned to a specific department")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors")
    public ResponseEntity<List<MentorDTO>> getMentorsByDepartment(
            @Parameter(description = "Department ID") @PathVariable String departmentId) {
        List<MentorDTO> mentors = adminService.getMentorsByDepartment(departmentId);
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/mentors/company")
    @Operation(summary = "Get mentors by company", description = "Search mentors placed in a specific company")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved mentors")
    public ResponseEntity<List<MentorDTO>> getMentorsByCompany(
            @Parameter(description = "Company name") @RequestParam String companyName) {
        List<MentorDTO> mentors = adminService.getMentorsByCompany(companyName);
        return ResponseEntity.ok(mentors);
    }

    // User Management APIs (for managing students)
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Retrieve list of all users (students)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved users list")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve user details by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDTO> getUserById(
            @Parameter(description = "User ID") @PathVariable String id) {
        UserDTO user = adminService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user", description = "Update user details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDTO> updateUser(
            @Parameter(description = "User ID") @PathVariable String id,
            @Valid @RequestBody UpdateUserDTO updateDTO) {
        UserDTO user = adminService.updateUser(id, updateDTO);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user", description = "Delete a user by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable String id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Activate/Deactivate user", description = "Toggle user active status")
    @ApiResponse(responseCode = "200", description = "User status updated")
    public ResponseEntity<UserDTO> toggleUserStatus(
            @Parameter(description = "User ID") @PathVariable String id) {
        UserDTO user = adminService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }
}

