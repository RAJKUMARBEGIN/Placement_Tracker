package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.dto.*;
import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.User;
import com.quizapplication.placement_tracker.entity.UserRole;
import com.quizapplication.placement_tracker.exception.ResourceAlreadyExistsException;
import com.quizapplication.placement_tracker.exception.ResourceNotFoundException;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import com.quizapplication.placement_tracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, DepartmentRepository departmentRepository, 
                      PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
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
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword())); // Encrypt password with BCrypt
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

        // Verify password using BCrypt
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
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

    @Transactional
    public UserDTO convertToMentor(Long id, ConvertToMentorDTO convertDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Check if user is currently a student
        if (user.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Only students can be converted to mentors");
        }

        // Update user role to MENTOR
        user.setRole(UserRole.MENTOR);
        user.setPlacedCompany(convertDTO.getPlacedCompany());
        user.setPlacedPosition(convertDTO.getPlacedPosition());
        
        if (convertDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(convertDTO.getPhoneNumber());
        }
        if (convertDTO.getLinkedinProfile() != null) {
            user.setLinkedinProfile(convertDTO.getLinkedinProfile());
        }
        if (convertDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(convertDTO.getDepartmentId())
                    .orElse(null);
            if (department != null) {
                user.setDepartment(department);
            }
        }
        if (convertDTO.getPlacementYear() != null) {
            user.setPlacementYear(convertDTO.getPlacementYear());
        } else if (user.getGraduationYear() != null) {
            // Default to graduation year if not provided
            user.setPlacementYear(user.getGraduationYear());
        }

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

    /**
     * Send OTP for password reset
     */
    public void sendPasswordResetOTP(String email) {
        // Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Send OTP via email
        String otp = emailService.sendOTP(email);
        if (otp == null) {
            throw new IllegalArgumentException("Invalid email domain. Only GCT emails are allowed.");
        }
        // OTP is stored in EmailService
    }

    /**
     * Reset password with OTP verification
     */
    @Transactional
    public void resetPassword(ResetPasswordDTO resetPasswordDTO) {
        // Find user by email
        User user = userRepository.findByEmail(resetPasswordDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + resetPasswordDTO.getEmail()));

        // Verify OTP
        if (!emailService.verifyOTP(resetPasswordDTO.getEmail(), resetPasswordDTO.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        // Update password with encryption
        user.setPassword(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        userRepository.save(user);
    }}