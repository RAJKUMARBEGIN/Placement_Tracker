package com.quizapplication.placement_tracker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Schema(description = "Interview Experience Data Transfer Object")
public class InterviewExperienceDTO {

    @Schema(description = "Experience ID", example = "1")
    private String id;

    @NotBlank(message = "Student name is required")
    @Schema(description = "Student name", example = "John Doe")
    private String studentName;

    @NotBlank(message = "Company name is required")
    @Schema(description = "Company name", example = "Google")
    private String companyName;

    @NotBlank(message = "Position is required")
    @Schema(description = "Position applied for", example = "Software Engineer")
    private String position;

    @Schema(description = "Year of placement", example = "2025")
    private Integer yearOfPlacement;

    @Schema(description = "Department ID", example = "1")
    private String departmentId;

    @Schema(description = "Department name", example = "Computer Science Engineering")
    private String departmentName;

    @Schema(description = "Total number of interview rounds", example = "4")
    private Integer totalRounds;

    @Schema(description = "Description of each round", example = "Round 1: Online Test, Round 2: Technical Interview...")
    private String roundsDescription;

    @Schema(description = "Questions asked in the interview", example = "Data structures, algorithms, system design...")
    private String questionsAsked;

    @Schema(description = "Problems solved during interview", example = "Binary tree traversal, sorting algorithms...")
    private String problemsSolved;

    @Schema(description = "Tips for in-person interview", example = "Be confident, maintain eye contact...")
    private String inPersonInterviewTips;

    @Schema(description = "Strategy used to crack the interview", example = "Practiced 300+ DSA problems...")
    private String crackingStrategy;

    @Schema(description = "Preparation details", example = "Started preparation 6 months before...")
    private String preparationDetails;

    @Schema(description = "Resources used for preparation", example = "LeetCode, GeeksforGeeks, YouTube channels...")
    private String resources;

    @Schema(description = "Willing to mentor juniors", example = "true")
    private Boolean willingToMentor;

    @Email(message = "Invalid email format")
    @Schema(description = "Contact email (optional)", example = "john.doe@example.com")
    private String contactEmail;

    @Schema(description = "Contact phone (optional)", example = "+91-9876543210")
    private String contactPhone;

    @Schema(description = "LinkedIn profile (optional)", example = "https://linkedin.com/in/johndoe")
    private String linkedinProfile;

    @Schema(description = "Submission timestamp", example = "2025-12-25T10:30:00")
    private LocalDateTime submittedAt;

    @Schema(description = "Resource file name", example = "interview-prep.zip")
    private String resourceFileName;
    @Schema(description = "Attachment file name (alias)", example = "interview-prep.zip")
    private String attachmentFileName;
    
    @Schema(description = "Resource file URL", example = "/uploads/interview-prep.zip")
    private String resourceFileUrl;
    @Schema(description = "Attachment file URL (alias)", example = "/uploads/interview-prep.zip")
    private String attachmentUrl;
    
    @Schema(description = "Resource file size in bytes", example = "1048576")
    private Long resourceFileSize;
    @Schema(description = "Attachment file size in bytes (alias)", example = "1048576")
    private Long attachmentSize;

    // Constructors
    public InterviewExperienceDTO() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Integer getYearOfPlacement() {
        return yearOfPlacement;
    }

    public void setYearOfPlacement(Integer yearOfPlacement) {
        this.yearOfPlacement = yearOfPlacement;
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

    public Integer getTotalRounds() {
        return totalRounds;
    }

    public void setTotalRounds(Integer totalRounds) {
        this.totalRounds = totalRounds;
    }

    public String getRoundsDescription() {
        return roundsDescription;
    }

    public void setRoundsDescription(String roundsDescription) {
        this.roundsDescription = roundsDescription;
    }

    public String getQuestionsAsked() {
        return questionsAsked;
    }

    public void setQuestionsAsked(String questionsAsked) {
        this.questionsAsked = questionsAsked;
    }

    public String getProblemsSolved() {
        return problemsSolved;
    }

    public void setProblemsSolved(String problemsSolved) {
        this.problemsSolved = problemsSolved;
    }

    public String getInPersonInterviewTips() {
        return inPersonInterviewTips;
    }

    public void setInPersonInterviewTips(String inPersonInterviewTips) {
        this.inPersonInterviewTips = inPersonInterviewTips;
    }

    public String getCrackingStrategy() {
        return crackingStrategy;
    }

    public void setCrackingStrategy(String crackingStrategy) {
        this.crackingStrategy = crackingStrategy;
    }

    public String getPreparationDetails() {
        return preparationDetails;
    }

    public void setPreparationDetails(String preparationDetails) {
        this.preparationDetails = preparationDetails;
    }

    public String getResources() {
        return resources;
    }

    public void setResources(String resources) {
        this.resources = resources;
    }

    public Boolean getWillingToMentor() {
        return willingToMentor;
    }

    public void setWillingToMentor(Boolean willingToMentor) {
        this.willingToMentor = willingToMentor;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getLinkedinProfile() {
        return linkedinProfile;
    }

    public void setLinkedinProfile(String linkedinProfile) {
        this.linkedinProfile = linkedinProfile;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getResourceFileName() {
        return resourceFileName;
    }

    public void setResourceFileName(String resourceFileName) {
        this.resourceFileName = resourceFileName;
    }

    public String getResourceFileUrl() {
        return resourceFileUrl;
    }

    public void setResourceFileUrl(String resourceFileUrl) {
        this.resourceFileUrl = resourceFileUrl;
    }

    public Long getResourceFileSize() {
        return resourceFileSize;
    }

    public void setResourceFileSize(Long resourceFileSize) {
        this.resourceFileSize = resourceFileSize;
    }

    // Alias getters/setters for attachment fields
    public String getAttachmentFileName() {
        return attachmentFileName != null ? attachmentFileName : resourceFileName;
    }

    public void setAttachmentFileName(String attachmentFileName) {
        this.attachmentFileName = attachmentFileName;
        if (this.resourceFileName == null) {
            this.resourceFileName = attachmentFileName;
        }
    }

    public String getAttachmentUrl() {
        return attachmentUrl != null ? attachmentUrl : resourceFileUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
        if (this.resourceFileUrl == null) {
            this.resourceFileUrl = attachmentUrl;
        }
    }

    public Long getAttachmentSize() {
        return attachmentSize != null ? attachmentSize : resourceFileSize;
    }

    public void setAttachmentSize(Long attachmentSize) {
        this.attachmentSize = attachmentSize;
        if (this.resourceFileSize == null) {
            this.resourceFileSize = attachmentSize;
        }
    }
}
