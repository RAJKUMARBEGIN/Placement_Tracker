package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.entity.PlacementExperience;
import com.quizapplication.placement_tracker.repository.PlacementExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlacementExperienceService {

    @Autowired
    private PlacementExperienceRepository repository;

    public List<PlacementExperience> getAllExperiences() {
        return repository.findAllByOrderBySubmittedAtDesc();
    }

    public Optional<PlacementExperience> getExperienceById(Long id) {
        return repository.findById(id);
    }

    public PlacementExperience createExperience(PlacementExperience experience) {
        return repository.save(experience);
    }

    public PlacementExperience updateExperience(Long id, PlacementExperience experience) {
        experience.setId(id);
        return repository.save(experience);
    }

    public void deleteExperience(Long id) {
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
}
