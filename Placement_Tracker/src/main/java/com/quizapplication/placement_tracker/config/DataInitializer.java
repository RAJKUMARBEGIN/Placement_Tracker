package com.quizapplication.placement_tracker.config;

import com.quizapplication.placement_tracker.entity.Admin;
import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.DepartmentGroup;
import com.quizapplication.placement_tracker.entity.User;
import com.quizapplication.placement_tracker.entity.UserRole;
import com.quizapplication.placement_tracker.repository.AdminRepository;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import com.quizapplication.placement_tracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DepartmentRepository departmentRepository, 
                          AdminRepository adminRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.departmentRepository = departmentRepository;
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize departments if they don't exist
        if (departmentRepository.count() == 0) {
            initializeDepartments();
        }
        
        // Initialize default admin if no admin exists
        if (adminRepository.count() == 0) {
            initializeDefaultAdmin();
        }
        
        // Initialize default admin user account for regular login
        if (!userRepository.existsByEmail("harshavardhinin6@gmail.com")) {
            initializeAdminUserAccount();
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

    private void initializeDefaultAdmin() {
        Admin defaultAdmin = new Admin();
        defaultAdmin.setUsername("admin");
        defaultAdmin.setPassword(passwordEncoder.encode("admin123"));
        defaultAdmin.setFullName("System Administrator");
        defaultAdmin.setEmail("harshavardhinin6@gmail.com");
        defaultAdmin.setIsActive(true);
        adminRepository.save(defaultAdmin);
        System.out.println("========================================");
        System.out.println("  DEFAULT ADMIN ACCOUNT CREATED");
        System.out.println("  Username: admin");
        System.out.println("  Password: admin123");
        System.out.println("  Admin Login: /admin-login");
        System.out.println("========================================");
    }
    
    private void initializeAdminUserAccount() {
        User adminUser = new User();
        adminUser.setEmail("harshavardhinin6@gmail.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setFullName("System Administrator");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setIsActive(true);
        adminUser.setIsApproved(true);
        userRepository.save(adminUser);
        System.out.println("========================================");
        System.out.println("  ADMIN USER ACCOUNT CREATED");
        System.out.println("  Email: harshavardhinin6@gmail.com");
        System.out.println("  Password: admin123");
        System.out.println("  Regular Login: /login");
        System.out.println("========================================");
    }
}
