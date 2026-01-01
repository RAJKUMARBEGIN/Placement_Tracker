package com.quizapplication.placement_tracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_experiences")
public class PlacementExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============ STUDENT INFO ============
    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String rollNumber;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String personalEmail;

    private String contactNumber;

    // ============ COMPANY INFO ============
    @Column(nullable = false)
    private String companyName;

    private String companyType; // IT, Core, etc.

    @Column
    private Integer placementYear; // Year when student was placed

    private String salary; // e.g., "15000(Intern Stipend) + 8 LPA(FTE)"

    private Boolean internOffered;

    private Boolean hasBond;

    private String bondDetails;

    // ============ SELECTION PROCESS ============
    @Column(nullable = false)
    private Integer totalRounds;

    // Store rounds as JSON string - each round contains detailed info
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String roundsJson; // JSON array of round objects

    // ============ OVERALL SUMMARY ============
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String overallExperience;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String generalTips;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String areasToPrepareFinal;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String suggestedResources;

    // ============ STATUS ============
    @Column(nullable = false)
    private String finalResult; // SELECTED, REJECTED, PENDING

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private String academicYear; // e.g., "2025-26"

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    // ============ CONSTRUCTORS ============
    public PlacementExperience() {
    }

    // ============ GETTERS AND SETTERS ============
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

    public String getCompanyType() {
        return companyType;
    }

    public void setCompanyType(String companyType) {
        this.companyType = companyType;
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

    public String getOverallExperience() {
        return overallExperience;
    }

    public void setOverallExperience(String overallExperience) {
        this.overallExperience = overallExperience;
    }

    public String getGeneralTips() {
        return generalTips;
    }

    public void setGeneralTips(String generalTips) {
        this.generalTips = generalTips;
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

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public Integer getPlacementYear() {
        return placementYear;
    }

    public void setPlacementYear(Integer placementYear) {
        this.placementYear = placementYear;
    }
}
