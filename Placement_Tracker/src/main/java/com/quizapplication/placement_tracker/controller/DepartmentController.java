package com.quizapplication.placement_tracker.controller;

import com.quizapplication.placement_tracker.dto.DepartmentDTO;
import com.quizapplication.placement_tracker.entity.DepartmentGroup;
import com.quizapplication.placement_tracker.service.DepartmentService;
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
@RequestMapping("/api/departments")
@Tag(name = "Department Management", description = "APIs for managing college departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    @Operation(summary = "Create a new department", description = "Add a new department to the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Department created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "409", description = "Department already exists")
    })
    public ResponseEntity<DepartmentDTO> createDepartment(@Valid @RequestBody DepartmentDTO departmentDTO) {
        DepartmentDTO createdDepartment = departmentService.createDepartment(departmentDTO);
        return new ResponseEntity<>(createdDepartment, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all departments", description = "Retrieve a list of all departments")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list")
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        List<DepartmentDTO> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID", description = "Retrieve a specific department by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Department found"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<DepartmentDTO> getDepartmentById(
            @Parameter(description = "Department ID") @PathVariable String id) {
        DepartmentDTO department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(department);
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get related departments", description = "Get departments in the same group (e.g., IT student sees IT and CSE)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved related departments"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<List<DepartmentDTO>> getRelatedDepartments(
            @Parameter(description = "Department ID") @PathVariable String id) {
        List<DepartmentDTO> departments = departmentService.getRelatedDepartments(id);
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/group/{group}")
    @Operation(summary = "Get departments by group", description = "Get all departments in a specific group")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved departments")
    public ResponseEntity<List<DepartmentDTO>> getDepartmentsByGroup(
            @Parameter(description = "Department group") @PathVariable DepartmentGroup group) {
        List<DepartmentDTO> departments = departmentService.getDepartmentsByGroup(group);
        return ResponseEntity.ok(departments);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update department", description = "Update an existing department")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Department updated successfully"),
            @ApiResponse(responseCode = "404", description = "Department not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<DepartmentDTO> updateDepartment(
            @Parameter(description = "Department ID") @PathVariable String id,
            @Valid @RequestBody DepartmentDTO departmentDTO) {
        DepartmentDTO updatedDepartment = departmentService.updateDepartment(id, departmentDTO);
        return ResponseEntity.ok(updatedDepartment);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department", description = "Delete a department by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Department deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<Void> deleteDepartment(
            @Parameter(description = "Department ID") @PathVariable String id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
