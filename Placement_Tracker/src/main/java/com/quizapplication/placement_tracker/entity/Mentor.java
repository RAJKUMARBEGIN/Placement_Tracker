package com.quizapplication.placement_tracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "mentors")
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String phoneNumber;

    @Column
    private String linkedinProfile;

    @Column(nullable = false)
    private String placedCompany;

    @Column
    private String placedPosition;

    @Column
    private Integer placementYear;

    @Column
    private Integer graduationYear;

    // Many-to-Many relationship with Department
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "mentor_departments",
        joinColumns = @JoinColumn(name = "mentor_id"),
        inverseJoinColumns = @JoinColumn(name = "department_id")
    )
    private Set<Department> departments = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Mentor() {
    }

    public Mentor(String fullName, String email, String placedCompany) {
        this.fullName = fullName;
        this.email = email;
        this.placedCompany = placedCompany;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public Set<Department> getDepartments() {
        return departments;
    }

    public void setDepartments(Set<Department> departments) {
        this.departments = departments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
