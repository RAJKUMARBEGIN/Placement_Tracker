package com.quizapplication.placement_tracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "interview_experiences")
public class InterviewExperience {

    @Id
    private String id;

    private String studentName;
    
    private String rollNumber;
    
    private String department;
    
    private String personalEmail;
    
    private String contactNumber;

    private String companyName;

    @JsonIgnore
    private String companyId;

    @JsonIgnore
    private String mentorId;

    private String position;

    private Integer yearOfPlacement;

    @JsonIgnore
    private String departmentId;
    
    private String salary;
    
    private Boolean internOffered;
    
    private Boolean hasBond;
    
    private String bondDetails;

    private Integer totalRounds;
    
    private String roundsJson;

    private String roundsDescription;

    private String questionsAsked;

    private String problemsSolved;

    private String inPersonInterviewTips;

    private String crackingStrategy;

    private String preparationDetails;

    private String resources;
    
    private String overallExperience;
    
    private String areasToPrepareFinal;
    
    private String suggestedResources;
    
    private String finalResult;

    private Boolean willingToMentor = false;

    private String contactEmail;

    private String contactPhone;

    private String linkedinProfile;

    private LocalDateTime submittedAt;

    // Resource file attachment (supporting both naming conventions)
    private String resourceFileName;
    private String attachmentFileName; // alias for resourceFileName
    
    private String resourceFileUrl;
    private String attachmentUrl; // alias for resourceFileUrl
    
    private Long resourceFileSize;
    private Long attachmentSize; // alias for resourceFileSize

    // Constructors
    public InterviewExperience() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
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
    
    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }
    
    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getPersonalEmail() {
        return personalEmail;
    }

    public void setPersonalEmail(String personalEmail) {
        this.personalEmail = personalEmail;
    }
    
    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
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
    
    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }
    
    public Boolean getInternOffered() {
        return internOffered;
    }

    public void setInternOffered(Boolean internOffered) {
        this.internOffered = internOffered;
    }
    
    public Boolean getHasBond() {
        return hasBond;
    }

    public void setHasBond(Boolean hasBond) {
        this.hasBond = hasBond;
    }
    
    public String getBondDetails() {
        return bondDetails;
    }

    public void setBondDetails(String bondDetails) {
        this.bondDetails = bondDetails;
    }

    public Integer getTotalRounds() {
        return totalRounds;
    }

    public void setTotalRounds(Integer totalRounds) {
        this.totalRounds = totalRounds;
    }
    
    public String getRoundsJson() {
        return roundsJson;
    }

    public void setRoundsJson(String roundsJson) {
        this.roundsJson = roundsJson;
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
    
    public String getOverallExperience() {
        return overallExperience;
    }

    public void setOverallExperience(String overallExperience) {
        this.overallExperience = overallExperience;
    }
    
    public String getAreasToPrepareFinal() {
        return areasToPrepareFinal;
    }

    public void setAreasToPrepareFinal(String areasToPrepareFinal) {
        this.areasToPrepareFinal = areasToPrepareFinal;
    }
    
    public String getSuggestedResources() {
        return suggestedResources;
    }

    public void setSuggestedResources(String suggestedResources) {
        this.suggestedResources = suggestedResources;
    }
    
    public String getFinalResult() {
        return finalResult;
    }

    public void setFinalResult(String finalResult) {
        this.finalResult = finalResult;
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

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getMentorId() {
        return mentorId;
    }

    public void setMentorId(String mentorId) {
        this.mentorId = mentorId;
    }
}
