package com.quizapplication.placement_tracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_experiences")
public class InterviewExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String companyName;

    @ManyToOne
    @JoinColumn(name = "company_id")
    @JsonIgnore
    private Company company;

    @ManyToOne
    @JoinColumn(name = "mentor_id")
    @JsonIgnore
    private User mentor;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    private Integer yearOfPlacement;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    @JsonIgnore
    private Department department;

    @Column(nullable = false)
    private Integer totalRounds;

    // Use LOB / LONGTEXT for very large text columns to avoid MySQL row-size limits
    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String roundsDescription;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String questionsAsked;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String problemsSolved;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String inPersonInterviewTips;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String crackingStrategy;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String preparationDetails;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String resources;

    @Column(nullable = true)
    private Boolean willingToMentor = false;

    @Column(nullable = true)
    private String contactEmail;

    @Column(nullable = true)
    private String contactPhone;

    @Column(nullable = true)
    private String linkedinProfile;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    // Constructors
    public InterviewExperience() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
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
