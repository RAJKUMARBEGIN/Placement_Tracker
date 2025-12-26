package com.quizapplication.placement_tracker.dto;

import com.quizapplication.placement_tracker.entity.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "User Registration Request")
public class RegisterDTO {

    @NotBlank(message = "Full name is required")
    @Schema(description = "User's full name", example = "John Doe")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "Email address", example = "john.doe@email.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "Password (min 6 characters)", example = "password123")
    private String password;

    @NotNull(message = "Role is required")
    @Schema(description = "User role (STUDENT or MENTOR)", example = "STUDENT")
    private UserRole role;

    @Schema(description = "Department ID (optional)", example = "1")
    private Long departmentId;

    @Schema(description = "Roll number (for students)", example = "20IT001")
    private String rollNumber;

    @Schema(description = "Year of study (for students)", example = "3")
    private Integer yearOfStudy;

    @Schema(description = "Graduation year", example = "2024")
    private Integer graduationYear;

    @Schema(description = "Phone number", example = "+91-9876543210")
    private String phoneNumber;

    @Schema(description = "LinkedIn profile URL", example = "https://linkedin.com/in/johndoe")
    private String linkedinProfile;

    // For mentors only
    @Schema(description = "Company where placed (for mentors)", example = "Google")
    private String placedCompany;

    @Schema(description = "Position at company (for mentors)", example = "Software Engineer")
    private String placedPosition;

    @Schema(description = "Year of placement (for mentors)", example = "2024")
    private Integer placementYear;

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getLinkedinProfile() {
        return linkedinProfile;
    }

    public void setLinkedinProfile(String linkedinProfile) {
        this.linkedinProfile = linkedinProfile;
    }

    public String getPlacedCompany() {
        return placedCompany;
    }

    public void setPlacedCompany(String placedCompany) {
        this.placedCompany = placedCompany;
    }

    public String getPlacedPosition() {
        return placedPosition;
    }

    public void setPlacedPosition(String placedPosition) {
        this.placedPosition = placedPosition;
    }

    public Integer getPlacementYear() {
        return placementYear;
    }

    public void setPlacementYear(Integer placementYear) {
        this.placementYear = placementYear;
    }
}
