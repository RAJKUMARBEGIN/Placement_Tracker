package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.dto.*;
import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.Mentor;
import com.quizapplication.placement_tracker.entity.User;
import com.quizapplication.placement_tracker.entity.UserRole;
import com.quizapplication.placement_tracker.exception.ResourceAlreadyExistsException;
import com.quizapplication.placement_tracker.exception.ResourceNotFoundException;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import com.quizapplication.placement_tracker.repository.MentorRepository;
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
    private final MentorRepository mentorRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, DepartmentRepository departmentRepository, 
                      MentorRepository mentorRepository, PasswordEncoder passwordEncoder, 
                      EmailService emailService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.mentorRepository = mentorRepository;
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
            // Verify department exists
            departmentRepository.findById(registerDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + registerDTO.getDepartmentId()));
            user.setDepartmentId(registerDTO.getDepartmentId());
        }
        
        user.setRollNumber(registerDTO.getRollNumber());
        user.setYearOfStudy(registerDTO.getYearOfStudy());
        user.setGraduationYear(registerDTO.getGraduationYear());
        user.setPhoneNumber(registerDTO.getPhoneNumber());
        user.setLinkedinProfile(registerDTO.getLinkedinProfile());
        user.setPlacedCompany(registerDTO.getPlacedCompany());
        user.setPlacedPosition(registerDTO.getPlacedPosition());
        user.setPlacementYear(registerDTO.getPlacementYear());
        user.setLocation(registerDTO.getLocation());
        user.setContactVisibility(registerDTO.getContactVisibility() != null ? registerDTO.getContactVisibility() : "PUBLIC");

        // Mentors need admin approval, students and admins are auto-approved
        if (registerDTO.getRole() == UserRole.MENTOR) {
            user.setIsApproved(false);
            // Generate unique approval token for email-based approval
            user.setApprovalToken(java.util.UUID.randomUUID().toString());
        } else {
            user.setIsApproved(true);
        }

        User savedUser = userRepository.save(user);

        // Send email notification to admin if mentor registered
        if (registerDTO.getRole() == UserRole.MENTOR) {
            sendMentorRegistrationNotification(savedUser);
        }

        return new AuthResponseDTO("Registration successful", convertToDTO(savedUser));
    }

    /**
     * Send email notification to admin when a new mentor registers
     */
    private void sendMentorRegistrationNotification(User mentor) {
        try {
            // Get department name
            String departmentName = null;
            if (mentor.getDepartmentId() != null) {
                try {
                    departmentName = departmentRepository.findById(mentor.getDepartmentId())
                        .map(dept -> dept.getDepartmentName())
                        .orElse("Not specified");
                } catch (Exception e) {
                    departmentName = "Not specified";
                }
            }
            
            emailService.sendMentorRegistrationNotification(
                mentor.getFullName(),
                mentor.getEmail(),
                mentor.getPlacedCompany(),
                mentor.getPlacedPosition(),
                departmentName,
                mentor.getPhoneNumber(),
                mentor.getLinkedinProfile(),
                mentor.getGraduationYear(),
                mentor.getPlacementYear(),
                mentor.getContactVisibility(),
                mentor.getApprovalToken()
            );
        } catch (Exception e) {
            System.err.println("Failed to send mentor registration notification: " + e.getMessage());
        }
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

        // Check if mentor is approved
        if (user.getRole() == UserRole.MENTOR && !Boolean.TRUE.equals(user.getIsApproved())) {
            throw new IllegalArgumentException("Your account is pending admin approval. You will receive an email once approved.");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponseDTO("Login successful", convertToDTO(user));
    }

    public UserDTO getUserById(String id) {
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

    public List<UserDTO> getMentorsByDepartment(String departmentId) {
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

    /**
     * Get all pending (unapproved) mentors
     */
    public List<UserDTO> getPendingMentors() {
        return userRepository.findByRoleAndIsApproved(UserRole.MENTOR, false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get only approved mentors (for public display)
     */
    public List<UserDTO> getApprovedMentors() {
        return userRepository.findByRoleAndIsApproved(UserRole.MENTOR, true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Approve a mentor
     */
    @Transactional
    public UserDTO approveMentor(String mentorId) {
        User user = userRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + mentorId));
        
        if (user.getRole() != UserRole.MENTOR) {
            throw new IllegalArgumentException("User is not a mentor");
        }
        
        user.setIsApproved(true);
        User updatedUser = userRepository.save(user);
        
        // Sync mentor data to mentors collection
        syncMentorToMentorsCollection(updatedUser);
        
        // Send approval notification to mentor
        try {
            emailService.sendMentorApprovalNotification(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send approval notification: " + e.getMessage());
        }
        
        return convertToDTO(updatedUser);
    }

    /**
     * Reject a mentor (delete their account)
     */
    @Transactional
    public void rejectMentor(String mentorId) {
        User user = userRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + mentorId));
        
        if (user.getRole() != UserRole.MENTOR) {
            throw new IllegalArgumentException("User is not a mentor");
        }
        
        userRepository.delete(user);
    }

    /**
     * Approve mentor via email token
     */
    @Transactional
    public UserDTO approveMentorViaToken(String token) {
        User user = userRepository.findByApprovalToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired approval token"));
        
        if (user.getRole() != UserRole.MENTOR) {
            throw new IllegalArgumentException("User is not a mentor");
        }
        
        if (user.getIsApproved()) {
            throw new IllegalArgumentException("Mentor is already approved");
        }
        
        user.setIsApproved(true);
        user.setApprovalToken(null); // Clear the token after use
        User updatedUser = userRepository.save(user);
        
        // Sync mentor data to mentors collection
        syncMentorToMentorsCollection(updatedUser);
        
        // Send approval notification to mentor
        try {
            emailService.sendMentorApprovalNotification(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send approval notification: " + e.getMessage());
        }
        
        return convertToDTO(updatedUser);
    }

    /**
     * Reject mentor via email token
     */
    @Transactional
    public void rejectMentorViaToken(String token) {
        User user = userRepository.findByApprovalToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired approval token"));
        
        if (user.getRole() != UserRole.MENTOR) {
            throw new IllegalArgumentException("User is not a mentor");
        }
        
        userRepository.delete(user);
    }

    @Transactional
    public UserDTO updateUser(String id, UserDTO userDTO) {
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
    public UserDTO convertToMentor(String id, ConvertToMentorDTO convertDTO) {
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
            // Verify department exists
            departmentRepository.findById(convertDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + convertDTO.getDepartmentId()));
            user.setDepartmentId(convertDTO.getDepartmentId());
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

    /**
     * Update user profile
     */
    @Transactional
    public UserDTO updateUserProfile(String id, UpdateProfileDTO updateProfileDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Update basic fields
        if (updateProfileDTO.getFullName() != null) {
            user.setFullName(updateProfileDTO.getFullName());
        }
        if (updateProfileDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(updateProfileDTO.getPhoneNumber());
        }
        if (updateProfileDTO.getLinkedinProfile() != null) {
            user.setLinkedinProfile(updateProfileDTO.getLinkedinProfile());
        }
        if (updateProfileDTO.getDepartmentId() != null) {
            user.setDepartmentId(updateProfileDTO.getDepartmentId());
        }
        if (updateProfileDTO.getGraduationYear() != null) {
            user.setGraduationYear(updateProfileDTO.getGraduationYear());
        }

        // Student specific fields
        if (updateProfileDTO.getRollNumber() != null) {
            user.setRollNumber(updateProfileDTO.getRollNumber());
        }
        if (updateProfileDTO.getYearOfStudy() != null) {
            user.setYearOfStudy(updateProfileDTO.getYearOfStudy());
        }

        // Mentor specific fields
        if (user.getRole() == UserRole.MENTOR) {
            if (updateProfileDTO.getPlacedCompany() != null) {
                user.setPlacedCompany(updateProfileDTO.getPlacedCompany());
            }
            if (updateProfileDTO.getPlacedPosition() != null) {
                user.setPlacedPosition(updateProfileDTO.getPlacedPosition());
            }
            if (updateProfileDTO.getPlacementYear() != null) {
                user.setPlacementYear(updateProfileDTO.getPlacementYear());
            }
            if (updateProfileDTO.getLocation() != null) {
                user.setLocation(updateProfileDTO.getLocation());
            }
            if (updateProfileDTO.getContactVisibility() != null) {
                user.setContactVisibility(updateProfileDTO.getContactVisibility());
            }

            // Sync to mentors collection if mentor is approved
            if (Boolean.TRUE.equals(user.getIsApproved())) {
                syncMentorToMentorsCollection(user);
            }
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    /**
     * Sync mentor data to the mentors collection
     */
    private void syncMentorToMentorsCollection(User user) {
        try {
            Mentor mentor = mentorRepository.findByEmail(user.getEmail())
                    .orElse(new Mentor());
            
            mentor.setFullName(user.getFullName());
            mentor.setEmail(user.getEmail());
            mentor.setPhoneNumber(user.getPhoneNumber());
            mentor.setLinkedinProfile(user.getLinkedinProfile());
            mentor.setPlacedCompany(user.getPlacedCompany());
            mentor.setPlacedPosition(user.getPlacedPosition());
            mentor.setPlacementYear(user.getPlacementYear());
            mentor.setGraduationYear(user.getGraduationYear());
            
            // Set department
            if (user.getDepartmentId() != null) {
                departmentRepository.findById(user.getDepartmentId()).ifPresent(dept -> {
                    mentor.setDepartmentIds(java.util.List.of(dept.getId()));
                });
            }
            
            mentor.setIsActive(true);
            mentorRepository.save(mentor);
        } catch (Exception e) {
            System.err.println("Failed to sync mentor to mentors collection: " + e.getMessage());
        }
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setDepartmentId(user.getDepartmentId());
        
        // Fetch department name if departmentId exists
        if (user.getDepartmentId() != null) {
            departmentRepository.findById(user.getDepartmentId()).ifPresent(dept -> {
                dto.setDepartmentName(dept.getDepartmentName());
                dto.setDepartmentCode(dept.getDepartmentCode());
            });
        }
        
        dto.setRollNumber(user.getRollNumber());
        dto.setYearOfStudy(user.getYearOfStudy());
        dto.setGraduationYear(user.getGraduationYear());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setLinkedinProfile(user.getLinkedinProfile());
        dto.setPlacedCompany(user.getPlacedCompany());
        dto.setPlacedPosition(user.getPlacedPosition());
        dto.setPlacementYear(user.getPlacementYear());
        dto.setLocation(user.getLocation());
        dto.setContactVisibility(user.getContactVisibility());
        dto.setIsApproved(user.getIsApproved());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }

    /**
     * Send OTP for password reset
     */
    public void sendPasswordResetOTP(String email) {
        // Check if user exists
        userRepository.findByEmail(email)
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
    }
}