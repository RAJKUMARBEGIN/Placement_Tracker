package com.quizapplication.placement_tracker.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String fullName;

    private UserRole role;

    private String departmentId;

    private String rollNumber;

    private Integer yearOfStudy;

    private Integer graduationYear;

    private String phoneNumber;

    private String linkedinProfile;

    // For mentors - company they got placed in
    private String placedCompany;

    private String placedPosition;

    private Integer placementYear;

    // Location/Place of the mentor
    private String location;

    // Contact visibility: "PUBLIC" (everyone can see), "ADMIN_ONLY" (only admins)
    private String contactVisibility = "PUBLIC";

    // Mentor approval status - mentors need verification code to access
    private Boolean isApproved = false;

    // Registration status for mentors: REGISTERED, WAITING_FOR_CODE, VERIFIED
    private String registrationStatus = "REGISTERED";  // REGISTERED -> WAITING_FOR_CODE -> VERIFIED

    // Verification code for mentors sent by admin
    private String verificationCode;
    
    // Whether the mentor has verified their code
    private Boolean isVerified = false;
    
    // Token for admin to send verification code securely
    private String adminApprovalToken;

    // Temporary password for sending in approval email (cleared after approval)
    private String tempPassword;

    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;

    private Boolean isActive = true;

    // Constructors
    public User() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    public String getApprovalToken() {
        return verificationCode;
    }

    public void setApprovalToken(String approvalToken) {
        this.verificationCode = approvalToken;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public String getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(String registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public String getAdminApprovalToken() {
        return adminApprovalToken;
    }

    public void setAdminApprovalToken(String adminApprovalToken) {
        this.adminApprovalToken = adminApprovalToken;
    }

    public String getTempPassword() {
        return tempPassword;
    }

    public void setTempPassword(String tempPassword) {
        this.tempPassword = tempPassword;
    }
}
