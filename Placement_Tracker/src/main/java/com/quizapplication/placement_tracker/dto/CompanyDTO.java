package com.quizapplication.placement_tracker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Schema(description = "Company Data Transfer Object")
public class CompanyDTO {

    @Schema(description = "Company ID", example = "1")
    private String id;

    @NotBlank(message = "Company name is required")
    @Schema(description = "Company name", example = "Google")
    private String companyName;

    @Schema(description = "Company description", example = "A multinational technology company")
    private String description;

    @Schema(description = "Industry type", example = "Technology")
    private String industry;

    @Schema(description = "Company website", example = "https://www.google.com")
    private String website;

    @Schema(description = "Company logo URL", example = "https://example.com/logo.png")
    private String logoUrl;

    @Schema(description = "Company headquarters", example = "Mountain View, CA")
    private String headquarters;

    @Schema(description = "Number of interview experiences shared")
    private Integer experienceCount;

    @Schema(description = "Created at timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Created by user ID")
    private String createdById;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getHeadquarters() {
        return headquarters;
    }

    public void setHeadquarters(String headquarters) {
        this.headquarters = headquarters;
    }

    public Integer getExperienceCount() {
        return experienceCount;
    }

    public void setExperienceCount(Integer experienceCount) {
        this.experienceCount = experienceCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
    }
}
