package com.quizapplication.placement_tracker.repository;

import com.quizapplication.placement_tracker.entity.PlacementExperience;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementExperienceRepository extends MongoRepository<PlacementExperience, String> {
    List<PlacementExperience> findByCompanyNameContainingIgnoreCase(String companyName);
    List<PlacementExperience> findByDepartmentContainingIgnoreCase(String department);
    List<PlacementExperience> findByFinalResult(String finalResult);
    List<PlacementExperience> findByAcademicYear(String academicYear);
    List<PlacementExperience> findAllByOrderBySubmittedAtDesc();
}
