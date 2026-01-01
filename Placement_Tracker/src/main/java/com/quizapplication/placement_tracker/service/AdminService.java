package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.dto.*;
import com.quizapplication.placement_tracker.entity.Admin;
import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.Mentor;
import com.quizapplication.placement_tracker.exception.ResourceAlreadyExistsException;
import com.quizapplication.placement_tracker.exception.ResourceNotFoundException;
import com.quizapplication.placement_tracker.repository.AdminRepository;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import com.quizapplication.placement_tracker.repository.MentorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final MentorRepository mentorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, MentorRepository mentorRepository,
                       DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.mentorRepository = mentorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Admin Login
    public AdminDTO login(AdminLoginDTO loginDTO) {
        Admin admin = adminRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));

        if (!passwordEncoder.matches(loginDTO.getPassword(), admin.getPassword())) {
            throw new ResourceNotFoundException("Invalid username or password");
        }

        if (!admin.getIsActive()) {
            throw new IllegalStateException("Admin account is inactive");
        }

        // Update last login
        admin.setLastLogin(LocalDateTime.now());
        adminRepository.save(admin);

        return convertToAdminDTO(admin);
    }

    // Create new admin (only existing admin can do this)
    public AdminDTO createAdmin(CreateAdminDTO createAdminDTO) {
        if (adminRepository.existsByUsername(createAdminDTO.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists");
        }

        if (createAdminDTO.getEmail() != null && adminRepository.existsByEmail(createAdminDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        Admin admin = new Admin();
        admin.setUsername(createAdminDTO.getUsername());
        admin.setPassword(passwordEncoder.encode(createAdminDTO.getPassword()));
        admin.setFullName(createAdminDTO.getFullName());
        admin.setEmail(createAdminDTO.getEmail());

        Admin savedAdmin = adminRepository.save(admin);
        return convertToAdminDTO(savedAdmin);
    }

    // Get admin by ID
    public AdminDTO getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));
        return convertToAdminDTO(admin);
    }

    // Create Mentor
    public MentorDTO createMentor(CreateMentorDTO createMentorDTO) {
        if (mentorRepository.existsByEmail(createMentorDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Mentor with this email already exists");
        }

        Mentor mentor = new Mentor();
        mentor.setFullName(createMentorDTO.getFullName());
        mentor.setEmail(createMentorDTO.getEmail());
        mentor.setPhoneNumber(createMentorDTO.getPhoneNumber());
        mentor.setLinkedinProfile(createMentorDTO.getLinkedinProfile());
        mentor.setPlacedCompany(createMentorDTO.getPlacedCompany());
        mentor.setPlacedPosition(createMentorDTO.getPlacedPosition());
        mentor.setPlacementYear(createMentorDTO.getPlacementYear());
        mentor.setGraduationYear(createMentorDTO.getGraduationYear());

        // Assign departments
        Set<Department> departments = new HashSet<>();
        for (Long deptId : createMentorDTO.getDepartmentIds()) {
            Department dept = departmentRepository.findById(deptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + deptId));
            departments.add(dept);
        }
        mentor.setDepartments(departments);

        Mentor savedMentor = mentorRepository.save(mentor);
        return convertToMentorDTO(savedMentor);
    }

    // Update Mentor
    public MentorDTO updateMentor(Long id, CreateMentorDTO updateDTO) {
        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found with id: " + id));

        // Check if email is being changed and if it already exists
        if (!mentor.getEmail().equals(updateDTO.getEmail()) && 
            mentorRepository.existsByEmail(updateDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Mentor with this email already exists");
        }

        mentor.setFullName(updateDTO.getFullName());
        mentor.setEmail(updateDTO.getEmail());
        mentor.setPhoneNumber(updateDTO.getPhoneNumber());
        mentor.setLinkedinProfile(updateDTO.getLinkedinProfile());
        mentor.setPlacedCompany(updateDTO.getPlacedCompany());
        mentor.setPlacedPosition(updateDTO.getPlacedPosition());
        mentor.setPlacementYear(updateDTO.getPlacementYear());
        mentor.setGraduationYear(updateDTO.getGraduationYear());

        // Update departments
        Set<Department> departments = new HashSet<>();
        for (Long deptId : updateDTO.getDepartmentIds()) {
            Department dept = departmentRepository.findById(deptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + deptId));
            departments.add(dept);
        }
        mentor.setDepartments(departments);

        Mentor updatedMentor = mentorRepository.save(mentor);
        return convertToMentorDTO(updatedMentor);
    }

    // Delete Mentor
    public void deleteMentor(Long id) {
        if (!mentorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mentor not found with id: " + id);
        }
        mentorRepository.deleteById(id);
    }

    // Get all mentors
    public List<MentorDTO> getAllMentors() {
        return mentorRepository.findByIsActiveTrue().stream()
                .map(this::convertToMentorDTO)
                .collect(Collectors.toList());
    }

    // Get mentor by ID
    public MentorDTO getMentorById(Long id) {
        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found with id: " + id));
        return convertToMentorDTO(mentor);
    }

    // Get mentors by department
    public List<MentorDTO> getMentorsByDepartment(Long departmentId) {
        return mentorRepository.findByDepartmentId(departmentId).stream()
                .map(this::convertToMentorDTO)
                .collect(Collectors.toList());
    }

    // Get mentors by company
    public List<MentorDTO> getMentorsByCompany(String companyName) {
        return mentorRepository.findByPlacedCompanyContainingIgnoreCase(companyName).stream()
                .map(this::convertToMentorDTO)
                .collect(Collectors.toList());
    }

    // Helper methods
    private AdminDTO convertToAdminDTO(Admin admin) {
        return new AdminDTO(
            admin.getId(),
            admin.getUsername(),
            admin.getFullName(),
            admin.getEmail(),
            admin.getCreatedAt(),
            admin.getLastLogin(),
            admin.getIsActive()
        );
    }

    private MentorDTO convertToMentorDTO(Mentor mentor) {
        MentorDTO dto = new MentorDTO();
        dto.setId(mentor.getId());
        dto.setFullName(mentor.getFullName());
        dto.setEmail(mentor.getEmail());
        dto.setPhoneNumber(mentor.getPhoneNumber());
        dto.setLinkedinProfile(mentor.getLinkedinProfile());
        dto.setPlacedCompany(mentor.getPlacedCompany());
        dto.setPlacedPosition(mentor.getPlacedPosition());
        dto.setPlacementYear(mentor.getPlacementYear());
        dto.setGraduationYear(mentor.getGraduationYear());
        dto.setCreatedAt(mentor.getCreatedAt());
        dto.setIsActive(mentor.getIsActive());

        // Convert departments
        Set<DepartmentDTO> deptDTOs = mentor.getDepartments().stream()
                .map(dept -> {
                    DepartmentDTO deptDTO = new DepartmentDTO();
                    deptDTO.setId(dept.getId());
                    deptDTO.setDepartmentName(dept.getDepartmentName());
                    deptDTO.setDepartmentCode(dept.getDepartmentCode());
                    deptDTO.setDescription(dept.getDescription());
                    return deptDTO;
                })
                .collect(Collectors.toSet());
        dto.setDepartments(deptDTOs);

        return dto;
    }
}
