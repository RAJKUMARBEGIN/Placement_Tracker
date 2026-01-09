package com.quizapplication.placement_tracker.repository;

import com.quizapplication.placement_tracker.entity.Mentor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorRepository extends MongoRepository<Mentor, String> {
    Optional<Mentor> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Mentor> findByPlacedCompanyContainingIgnoreCase(String companyName);
    
    @Query("{ 'departmentIds': ?0 }")
    List<Mentor> findByDepartmentId(String departmentId);
    
    List<Mentor> findByIsActiveTrue();
}
