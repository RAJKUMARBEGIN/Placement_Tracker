package com.quizapplication.placement_tracker.dto;

import com.quizapplication.placement_tracker.entity.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "User Response")
public class UserDTO {

    @Schema(description = "User ID", example = "1")
    private String id;

    @Schema(description = "User email", example = "john.doe@gct.ac.in")
    private String email;

    @Schema(description = "User's full name", example = "John Doe")
    private String fullName;

    @Schema(description = "User role", example = "STUDENT")
    private UserRole role;

    @Schema(description = "Department ID", example = "1")
    private String departmentId;

    @Schema(description = "Department name", example = "Information Technology")
    private String departmentName;

    @Schema(description = "Department code", example = "IT")
    private String departmentCode;

    @Schema(description = "Roll number", example = "20IT001")
    private String rollNumber;

    @Schema(description = "Year of study", example = "3")
    private Integer yearOfStudy;

    @Schema(description = "Graduation year", example = "2024")
    private Integer graduationYear;

    @Schema(description = "Phone number", example = "+91-9876543210")
    private String phoneNumber;

    @Schema(description = "LinkedIn profile URL", example = "https://linkedin.com/in/johndoe")
    private String linkedinProfile;

    @Schema(description = "Company where placed (for mentors)", example = "Google")
    private String placedCompany;

    @Schema(description = "Position at company (for mentors)", example = "Software Engineer")
    private String placedPosition;

    @Schema(description = "Year of placement (for mentors)", example = "2024")
    private Integer placementYear;

    @Schema(description = "Location/Place of the mentor", example = "Bangalore, Karnataka")
    private String location;

    @Schema(description = "Contact visibility: PUBLIC or ADMIN_ONLY", example = "PUBLIC")
    private String contactVisibility;

    @Schema(description = "Mentor approval status", example = "false")
    private Boolean isApproved;

    @Schema(description = "Account active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Account creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Last login time")
    private LocalDateTime lastLogin;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactVisibility() {
        return contactVisibility;
    }

    public void setContactVisibility(String contactVisibility) {
        this.contactVisibility = contactVisibility;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
