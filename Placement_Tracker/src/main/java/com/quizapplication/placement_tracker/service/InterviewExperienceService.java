package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.dto.InterviewExperienceDTO;
import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.InterviewExperience;
import com.quizapplication.placement_tracker.exception.ResourceNotFoundException;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import com.quizapplication.placement_tracker.repository.InterviewExperienceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class InterviewExperienceService {

    private final InterviewExperienceRepository experienceRepository;
    private final DepartmentRepository departmentRepository;

    public InterviewExperienceService(InterviewExperienceRepository experienceRepository,
                                     DepartmentRepository departmentRepository) {
        this.experienceRepository = experienceRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public InterviewExperienceDTO createExperience(InterviewExperienceDTO dto) {
        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        InterviewExperience experience = new InterviewExperience();
        experience.setStudentName(dto.getStudentName());
        experience.setCompanyName(dto.getCompanyName());
        experience.setPosition(dto.getPosition());
        experience.setYearOfPlacement(dto.getYearOfPlacement());
        experience.setDepartment(department);
        experience.setTotalRounds(dto.getTotalRounds());
        experience.setRoundsDescription(dto.getRoundsDescription());
        experience.setQuestionsAsked(dto.getQuestionsAsked());
        experience.setProblemsSolved(dto.getProblemsSolved());
        experience.setInPersonInterviewTips(dto.getInPersonInterviewTips());
        experience.setCrackingStrategy(dto.getCrackingStrategy());
        experience.setPreparationDetails(dto.getPreparationDetails());
        experience.setResources(dto.getResources());
        experience.setWillingToMentor(dto.getWillingToMentor() != null ? dto.getWillingToMentor() : false);
        experience.setContactEmail(dto.getContactEmail());
        experience.setContactPhone(dto.getContactPhone());
        experience.setLinkedinProfile(dto.getLinkedinProfile());

        InterviewExperience savedExperience = experienceRepository.save(experience);
        return convertToDTO(savedExperience);
    }

    public List<InterviewExperienceDTO> getAllExperiences() {
        return experienceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InterviewExperienceDTO getExperienceById(Long id) {
        InterviewExperience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview experience not found with id: " + id));
        return convertToDTO(experience);
    }

    public List<InterviewExperienceDTO> getExperiencesByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        return experienceRepository.findByDepartmentId(departmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InterviewExperienceDTO> searchByCompany(String companyName) {
        return experienceRepository.findByCompanyNameContainingIgnoreCase(companyName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InterviewExperienceDTO> getExperiencesByYear(Integer year) {
        return experienceRepository.findByYearOfPlacement(year).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InterviewExperienceDTO> getMentorsAvailable() {
        return experienceRepository.findByWillingToMentor(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InterviewExperienceDTO> getExperiencesByDepartmentAndYear(Long departmentId, Integer year) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        return experienceRepository.findByDepartmentIdAndYearOfPlacement(departmentId, year).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewExperienceDTO updateExperience(Long id, InterviewExperienceDTO dto) {
        InterviewExperience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview experience not found with id: " + id));

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        experience.setStudentName(dto.getStudentName());
        experience.setCompanyName(dto.getCompanyName());
        experience.setPosition(dto.getPosition());
        experience.setYearOfPlacement(dto.getYearOfPlacement());
        experience.setDepartment(department);
        experience.setTotalRounds(dto.getTotalRounds());
        experience.setRoundsDescription(dto.getRoundsDescription());
        experience.setQuestionsAsked(dto.getQuestionsAsked());
        experience.setProblemsSolved(dto.getProblemsSolved());
        experience.setInPersonInterviewTips(dto.getInPersonInterviewTips());
        experience.setCrackingStrategy(dto.getCrackingStrategy());
        experience.setPreparationDetails(dto.getPreparationDetails());
        experience.setResources(dto.getResources());
        experience.setWillingToMentor(dto.getWillingToMentor() != null ? dto.getWillingToMentor() : false);
        experience.setContactEmail(dto.getContactEmail());
        experience.setContactPhone(dto.getContactPhone());
        experience.setLinkedinProfile(dto.getLinkedinProfile());

        InterviewExperience updatedExperience = experienceRepository.save(experience);
        return convertToDTO(updatedExperience);
    }

    @Transactional
    public void deleteExperience(Long id) {
        if (!experienceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Interview experience not found with id: " + id);
        }
        experienceRepository.deleteById(id);
    }

    private InterviewExperienceDTO convertToDTO(InterviewExperience experience) {
        InterviewExperienceDTO dto = new InterviewExperienceDTO();
        dto.setId(experience.getId());
        dto.setStudentName(experience.getStudentName());
        dto.setCompanyName(experience.getCompanyName());
        dto.setPosition(experience.getPosition());
        dto.setYearOfPlacement(experience.getYearOfPlacement());
        dto.setDepartmentId(experience.getDepartment().getId());
        dto.setDepartmentName(experience.getDepartment().getDepartmentName());
        dto.setTotalRounds(experience.getTotalRounds());
        dto.setRoundsDescription(experience.getRoundsDescription());
        dto.setQuestionsAsked(experience.getQuestionsAsked());
        dto.setProblemsSolved(experience.getProblemsSolved());
        dto.setInPersonInterviewTips(experience.getInPersonInterviewTips());
        dto.setCrackingStrategy(experience.getCrackingStrategy());
        dto.setPreparationDetails(experience.getPreparationDetails());
        dto.setResources(experience.getResources());
        dto.setWillingToMentor(experience.getWillingToMentor());
        dto.setContactEmail(experience.getContactEmail());
        dto.setContactPhone(experience.getContactPhone());
        dto.setLinkedinProfile(experience.getLinkedinProfile());
        dto.setSubmittedAt(experience.getSubmittedAt());
        return dto;
    }
}
