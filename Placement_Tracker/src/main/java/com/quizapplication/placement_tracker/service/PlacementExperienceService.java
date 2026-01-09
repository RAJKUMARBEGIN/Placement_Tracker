package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.entity.PlacementExperience;
import com.quizapplication.placement_tracker.repository.PlacementExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlacementExperienceService {

    @Autowired
    private PlacementExperienceRepository repository;

    public List<PlacementExperience> getAllExperiences() {
        return repository.findAllByOrderBySubmittedAtDesc();
    }

    public Optional<PlacementExperience> getExperienceById(String id) {
        return repository.findById(id);
    }

    public PlacementExperience createExperience(PlacementExperience experience) {
        return repository.save(experience);
    }

    public PlacementExperience updateExperience(String id, PlacementExperience experience) {
        experience.setId(id);
        return repository.save(experience);
    }

    public void deleteExperience(String id) {
        repository.deleteById(id);
    }

    public List<PlacementExperience> searchByCompany(String companyName) {
        return repository.findByCompanyNameContainingIgnoreCase(companyName);
    }

    public List<PlacementExperience> searchByDepartment(String department) {
        return repository.findByDepartmentContainingIgnoreCase(department);
    }

    public List<PlacementExperience> getByResult(String result) {
        return repository.findByFinalResult(result);
    }

    // Group experiences by company and year
    public Map<String, Map<Integer, List<PlacementExperience>>> getExperiencesGroupedByCompanyAndYear() {
        List<PlacementExperience> allExperiences = repository.findAllByOrderBySubmittedAtDesc();
        
        return allExperiences.stream()
                .collect(Collectors.groupingBy(
                        PlacementExperience::getCompanyName,
                        Collectors.groupingBy(exp -> {
                            // If placementYear is null, use current year
                            Integer year = exp.getPlacementYear();
                            return year != null ? year : java.time.Year.now().getValue();
                        })
                ));
    }

    // Get experiences for a specific company grouped by year
    public Map<Integer, List<PlacementExperience>> getExperiencesByCompanyGroupedByYear(String companyName) {
        List<PlacementExperience> companyExperiences = repository.findByCompanyNameContainingIgnoreCase(companyName);
        
        return companyExperiences.stream()
                .collect(Collectors.groupingBy(exp -> {
                    // If placementYear is null, use current year
                    Integer year = exp.getPlacementYear();
                    return year != null ? year : java.time.Year.now().getValue();
                }));
    }
}
