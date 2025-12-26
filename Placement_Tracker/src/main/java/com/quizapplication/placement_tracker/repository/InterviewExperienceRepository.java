package com.quizapplication.placement_tracker.repository;

import com.quizapplication.placement_tracker.entity.InterviewExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewExperienceRepository extends JpaRepository<InterviewExperience, Long> {
    List<InterviewExperience> findByDepartmentId(Long departmentId);
    List<InterviewExperience> findByCompanyNameContainingIgnoreCase(String companyName);
    List<InterviewExperience> findByYearOfPlacement(Integer year);
    List<InterviewExperience> findByWillingToMentor(Boolean willingToMentor);
    List<InterviewExperience> findByDepartmentIdAndYearOfPlacement(Long departmentId, Integer year);
}

