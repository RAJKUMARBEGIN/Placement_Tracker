package com.quizapplication.placement_tracker.controller;

import com.quizapplication.placement_tracker.dto.InterviewExperienceDTO;
import com.quizapplication.placement_tracker.service.InterviewExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiences")
@Tag(name = "Interview Experience Management", description = "APIs for managing interview experiences shared by placed students")
public class InterviewExperienceController {

    private final InterviewExperienceService experienceService;

    public InterviewExperienceController(InterviewExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @PostMapping
    @Operation(summary = "Share interview experience", description = "Allow placed students to share their interview experience")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Experience shared successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<InterviewExperienceDTO> createExperience(@Valid @RequestBody InterviewExperienceDTO experienceDTO) {
        InterviewExperienceDTO createdExperience = experienceService.createExperience(experienceDTO);
        return new ResponseEntity<>(createdExperience, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all interview experiences", description = "Retrieve all interview experiences from the database")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list")
    public ResponseEntity<List<InterviewExperienceDTO>> getAllExperiences() {
        List<InterviewExperienceDTO> experiences = experienceService.getAllExperiences();
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get experience by ID", description = "Retrieve a specific interview experience by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Experience found"),
            @ApiResponse(responseCode = "404", description = "Experience not found")
    })
    public ResponseEntity<InterviewExperienceDTO> getExperienceById(
            @Parameter(description = "Experience ID") @PathVariable String id) {
        InterviewExperienceDTO experience = experienceService.getExperienceById(id);
        return ResponseEntity.ok(experience);
    }

    @GetMapping("/department/{departmentId}")
    @Operation(summary = "Get experiences by department", description = "Retrieve all interview experiences for a specific department")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<List<InterviewExperienceDTO>> getExperiencesByDepartment(
            @Parameter(description = "Department ID") @PathVariable String departmentId) {
        List<InterviewExperienceDTO> experiences = experienceService.getExperiencesByDepartment(departmentId);
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/search/company")
    @Operation(summary = "Search by company name", description = "Search interview experiences by company name")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list")
    public ResponseEntity<List<InterviewExperienceDTO>> searchByCompany(
            @Parameter(description = "Company name") @RequestParam String companyName) {
        List<InterviewExperienceDTO> experiences = experienceService.searchByCompany(companyName);
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/year/{year}")
    @Operation(summary = "Get experiences by year", description = "Retrieve interview experiences by placement year")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list")
    public ResponseEntity<List<InterviewExperienceDTO>> getExperiencesByYear(
            @Parameter(description = "Placement year") @PathVariable Integer year) {
        List<InterviewExperienceDTO> experiences = experienceService.getExperiencesByYear(year);
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/mentors")
    @Operation(summary = "Get available mentors", description = "Retrieve list of seniors willing to mentor")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of mentors")
    public ResponseEntity<List<InterviewExperienceDTO>> getMentorsAvailable() {
        List<InterviewExperienceDTO> mentors = experienceService.getMentorsAvailable();
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/department/{departmentId}/year/{year}")
    @Operation(summary = "Get experiences by department and year", description = "Retrieve interview experiences filtered by department and year")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<List<InterviewExperienceDTO>> getExperiencesByDepartmentAndYear(
            @Parameter(description = "Department ID") @PathVariable String departmentId,
            @Parameter(description = "Placement year") @PathVariable Integer year) {
        List<InterviewExperienceDTO> experiences = experienceService.getExperiencesByDepartmentAndYear(departmentId, year);
        return ResponseEntity.ok(experiences);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update interview experience", description = "Update an existing interview experience")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Experience updated successfully"),
            @ApiResponse(responseCode = "404", description = "Experience not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<InterviewExperienceDTO> updateExperience(
            @Parameter(description = "Experience ID") @PathVariable String id,
            @Valid @RequestBody InterviewExperienceDTO experienceDTO) {
        InterviewExperienceDTO updatedExperience = experienceService.updateExperience(id, experienceDTO);
        return ResponseEntity.ok(updatedExperience);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete interview experience", description = "Delete an interview experience by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Experience deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Experience not found")
    })
    public ResponseEntity<Void> deleteExperience(
            @Parameter(description = "Experience ID") @PathVariable String id) {
        experienceService.deleteExperience(id);
        return ResponseEntity.noContent().build();
    }
}
