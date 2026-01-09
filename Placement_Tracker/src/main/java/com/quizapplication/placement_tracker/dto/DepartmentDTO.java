package com.quizapplication.placement_tracker.dto;

import com.quizapplication.placement_tracker.entity.DepartmentGroup;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Department Data Transfer Object")
public class DepartmentDTO {

    @Schema(description = "Department ID", example = "1")
    private String id;

    @NotBlank(message = "Department name is required")
    @Schema(description = "Department name", example = "Information Technology")
    private String departmentName;

    @NotBlank(message = "Department code is required")
    @Schema(description = "Department code", example = "IT")
    private String departmentCode;

    @Schema(description = "Department description", example = "IT department focusing on software development")
    private String description;

    @NotNull(message = "Department group is required")
    @Schema(description = "Department group for related departments", example = "CS_IT")
    private DepartmentGroup departmentGroup;

    public DepartmentDTO() {
    }

    public DepartmentDTO(String id, String departmentName, String departmentCode, String description, DepartmentGroup departmentGroup) {
        this.id = id;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.description = description;
        this.departmentGroup = departmentGroup;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DepartmentGroup getDepartmentGroup() {
        return departmentGroup;
    }

    public void setDepartmentGroup(DepartmentGroup departmentGroup) {
        this.departmentGroup = departmentGroup;
    }
}
