package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.dto.*;
import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.User;
import com.quizapplication.placement_tracker.entity.UserRole;
import com.quizapplication.placement_tracker.exception.ResourceAlreadyExistsException;
import com.quizapplication.placement_tracker.exception.ResourceNotFoundException;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import com.quizapplication.placement_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public AuthService(UserRepository userRepository, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public AuthResponseDTO register(RegisterDTO registerDTO) {
        // Check if email already exists
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("User with email '" + registerDTO.getEmail() + "' already exists");
        }

        // Create user
        User user = new User();
        user.setEmail(registerDTO.getEmail());
        user.setPassword(registerDTO.getPassword()); // In production, use password encoder
        user.setFullName(registerDTO.getFullName());
        user.setRole(registerDTO.getRole());
        
        // Department is optional
        if (registerDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(registerDTO.getDepartmentId())
                    .orElse(null);
            user.setDepartment(department);
        }
        
        user.setRollNumber(registerDTO.getRollNumber());
        user.setYearOfStudy(registerDTO.getYearOfStudy());
        user.setGraduationYear(registerDTO.getGraduationYear());
        user.setPhoneNumber(registerDTO.getPhoneNumber());
        user.setLinkedinProfile(registerDTO.getLinkedinProfile());
        user.setPlacedCompany(registerDTO.getPlacedCompany());
        user.setPlacedPosition(registerDTO.getPlacedPosition());
        user.setPlacementYear(registerDTO.getPlacementYear());

        User savedUser = userRepository.save(user);

        return new AuthResponseDTO("Registration successful", convertToDTO(savedUser));
    }

    @Transactional
    public AuthResponseDTO login(LoginDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginDTO.getEmail()));

        // Simple password check (in production, use password encoder)
        if (!user.getPassword().equals(loginDTO.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        if (!user.getIsActive()) {
            throw new IllegalArgumentException("Account is deactivated");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponseDTO("Login successful", convertToDTO(user));
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return convertToDTO(user);
    }

    public List<UserDTO> getAllMentors() {
        return userRepository.findByRole(UserRole.MENTOR).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getMentorsByDepartment(Long departmentId) {
        return userRepository.findByRoleAndDepartmentId(UserRole.MENTOR, departmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getMentorsByCompany(String companyName) {
        return userRepository.findByPlacedCompanyContainingIgnoreCase(companyName).stream()
                .filter(u -> u.getRole() == UserRole.MENTOR)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userDTO.getFullName() != null) user.setFullName(userDTO.getFullName());
        if (userDTO.getPhoneNumber() != null) user.setPhoneNumber(userDTO.getPhoneNumber());
        if (userDTO.getLinkedinProfile() != null) user.setLinkedinProfile(userDTO.getLinkedinProfile());
        if (userDTO.getYearOfStudy() != null) user.setYearOfStudy(userDTO.getYearOfStudy());
        if (userDTO.getGraduationYear() != null) user.setGraduationYear(userDTO.getGraduationYear());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        if (user.getDepartment() != null) {
            dto.setDepartmentId(user.getDepartment().getId());
            dto.setDepartmentName(user.getDepartment().getDepartmentName());
            dto.setDepartmentCode(user.getDepartment().getDepartmentCode());
        }
        dto.setRollNumber(user.getRollNumber());
        dto.setYearOfStudy(user.getYearOfStudy());
        dto.setGraduationYear(user.getGraduationYear());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setLinkedinProfile(user.getLinkedinProfile());
        dto.setPlacedCompany(user.getPlacedCompany());
        dto.setPlacedPosition(user.getPlacedPosition());
        dto.setPlacementYear(user.getPlacementYear());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }
}
