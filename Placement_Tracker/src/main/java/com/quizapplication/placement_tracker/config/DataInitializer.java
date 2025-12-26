package com.quizapplication.placement_tracker.config;

import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.DepartmentGroup;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;

    public DataInitializer(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public void run(String... args) {
        // Initialize departments if they don't exist
        if (departmentRepository.count() == 0) {
            initializeDepartments();
        }
    }

    private void initializeDepartments() {
        // CS_IT Group - CSE and IT can see each other's placements
        createDepartment("Computer Science and Engineering", "CSE", 
                "Computer Science and Engineering department", DepartmentGroup.CS_IT);
        createDepartment("Information Technology", "IT", 
                "Information Technology department", DepartmentGroup.CS_IT);

        // Electronics Group - ECE, EEE, EIE can see each other's placements
        createDepartment("Electronics and Communication Engineering", "ECE", 
                "Electronics and Communication Engineering department", DepartmentGroup.ELECTRONICS);
        createDepartment("Electrical and Electronics Engineering", "EEE", 
                "Electrical and Electronics Engineering department", DepartmentGroup.ELECTRONICS);
        createDepartment("Electronics and Instrumentation Engineering", "EIE", 
                "Electronics and Instrumentation Engineering department", DepartmentGroup.ELECTRONICS);

        // Mechanical Group
        createDepartment("Mechanical Engineering", "MECH", 
                "Mechanical Engineering department", DepartmentGroup.MECHANICAL);
        createDepartment("Production Engineering", "PROD", 
                "Production Engineering department", DepartmentGroup.MECHANICAL);

        // Civil
        createDepartment("Civil Engineering", "CIVIL", 
                "Civil Engineering department", DepartmentGroup.CIVIL);

        // Biotech
        createDepartment("Industrial Biotechnology", "IBT", 
                "Industrial Biotechnology department", DepartmentGroup.BIOTECH);

        System.out.println("✅ Departments initialized successfully!");
    }

    private void createDepartment(String name, String code, String description, DepartmentGroup group) {
        if (!departmentRepository.existsByDepartmentCode(code)) {
            Department dept = new Department();
            dept.setDepartmentName(name);
            dept.setDepartmentCode(code);
            dept.setDescription(description);
            dept.setDepartmentGroup(group);
            departmentRepository.save(dept);
            System.out.println("Created department: " + code + " - " + name);
        }
    }
}
