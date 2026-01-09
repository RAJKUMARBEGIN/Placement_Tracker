package com.quizapplication.placement_tracker.controller;

import com.quizapplication.placement_tracker.dto.CompanyDTO;
import com.quizapplication.placement_tracker.service.CompanyService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@Tag(name = "Company Management", description = "APIs for managing companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    @Operation(summary = "Create a new company", description = "Add a new company to the system (for mentors)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Company created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "409", description = "Company already exists")
    })
    public ResponseEntity<CompanyDTO> createCompany(
            @Valid @RequestBody CompanyDTO companyDTO,
            @Parameter(description = "User ID of creator") @RequestParam(required = false) String userId) {
        CompanyDTO createdCompany = companyService.createCompany(companyDTO, userId);
        return new ResponseEntity<>(createdCompany, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all companies", description = "Retrieve list of all companies")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list")
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        List<CompanyDTO> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company by ID", description = "Retrieve a specific company by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Company found"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    public ResponseEntity<CompanyDTO> getCompanyById(
            @Parameter(description = "Company ID") @PathVariable String id) {
        CompanyDTO company = companyService.getCompanyById(id);
        return ResponseEntity.ok(company);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get company by name", description = "Retrieve a company by its name")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Company found"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    public ResponseEntity<CompanyDTO> getCompanyByName(
            @Parameter(description = "Company name") @PathVariable String name) {
        CompanyDTO company = companyService.getCompanyByName(name);
        return ResponseEntity.ok(company);
    }

    @GetMapping("/search")
    @Operation(summary = "Search companies", description = "Search companies by name")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved results")
    public ResponseEntity<List<CompanyDTO>> searchCompanies(
            @Parameter(description = "Search query") @RequestParam String query) {
        List<CompanyDTO> companies = companyService.searchCompanies(query);
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/exists")
    @Operation(summary = "Check if company exists", description = "Check if a company with the given name exists")
    @ApiResponse(responseCode = "200", description = "Check completed")
    public ResponseEntity<Map<String, Boolean>> companyExists(
            @Parameter(description = "Company name") @RequestParam String companyName) {
        boolean exists = companyService.companyExists(companyName);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update company", description = "Update company details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Company updated successfully"),
            @ApiResponse(responseCode = "404", description = "Company not found"),
            @ApiResponse(responseCode = "409", description = "Company name already exists")
    })
    public ResponseEntity<CompanyDTO> updateCompany(
            @Parameter(description = "Company ID") @PathVariable String id,
            @RequestBody CompanyDTO companyDTO) {
        CompanyDTO updatedCompany = companyService.updateCompany(id, companyDTO);
        return ResponseEntity.ok(updatedCompany);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete company", description = "Delete a company by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Company deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    public ResponseEntity<Void> deleteCompany(
            @Parameter(description = "Company ID") @PathVariable String id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
