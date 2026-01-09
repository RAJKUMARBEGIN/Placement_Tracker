package com.quizapplication.placement_tracker.repository;

import com.quizapplication.placement_tracker.entity.InterviewExperience;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewExperienceRepository extends MongoRepository<InterviewExperience, String> {
    List<InterviewExperience> findByDepartmentId(String departmentId);
    List<InterviewExperience> findByCompanyNameContainingIgnoreCase(String companyName);
    List<InterviewExperience> findByYearOfPlacement(Integer year);
    List<InterviewExperience> findByWillingToMentor(Boolean willingToMentor);
    List<InterviewExperience> findByDepartmentIdAndYearOfPlacement(String departmentId, Integer year);
}

