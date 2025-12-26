package com.quizapplication.placement_tracker.repository;

import com.quizapplication.placement_tracker.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyNameIgnoreCase(String companyName);
    boolean existsByCompanyNameIgnoreCase(String companyName);
    List<Company> findByCompanyNameContainingIgnoreCase(String companyName);
    List<Company> findByIndustryIgnoreCase(String industry);
}
