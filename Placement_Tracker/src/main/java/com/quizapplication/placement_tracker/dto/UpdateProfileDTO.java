package com.quizapplication.placement_tracker.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Update Profile Request")
public class UpdateProfileDTO {

    @Schema(description = "User's full name", example = "John Doe")
    private String fullName;

    @Schema(description = "Phone number", example = "+91-9876543210")
    private String phoneNumber;

    @Schema(description = "LinkedIn profile URL", example = "https://linkedin.com/in/johndoe")
    private String linkedinProfile;

    @Schema(description = "Department ID", example = "1")
    private String departmentId;

    @Schema(description = "Roll number (for students)", example = "20IT001")
    private String rollNumber;

    @Schema(description = "Year of study (for students)", example = "3")
    private Integer yearOfStudy;

    @Schema(description = "Graduation year", example = "2024")
    private Integer graduationYear;

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

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
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
}
