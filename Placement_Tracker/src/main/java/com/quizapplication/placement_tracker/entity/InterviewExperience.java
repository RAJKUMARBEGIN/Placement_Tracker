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

    private String companyName;

    @JsonIgnore
    private String companyId;

    @JsonIgnore
    private String mentorId;

    private String position;

    private Integer yearOfPlacement;

    @JsonIgnore
    private String departmentId;

    private Integer totalRounds;

    private String roundsDescription;

    private String questionsAsked;

    private String problemsSolved;

    private String inPersonInterviewTips;

    private String crackingStrategy;

    private String preparationDetails;

    private String resources;

    private Boolean willingToMentor = false;

    private String contactEmail;

    private String contactPhone;

    private String linkedinProfile;

    private LocalDateTime submittedAt;

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
}
