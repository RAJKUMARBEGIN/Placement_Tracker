package com.quizapplication.placement_tracker.repository;

import com.quizapplication.placement_tracker.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Mentor> findByPlacedCompanyContainingIgnoreCase(String companyName);
    
    @Query("SELECT m FROM Mentor m JOIN m.departments d WHERE d.id = :departmentId")
    List<Mentor> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    List<Mentor> findByIsActiveTrue();
}
