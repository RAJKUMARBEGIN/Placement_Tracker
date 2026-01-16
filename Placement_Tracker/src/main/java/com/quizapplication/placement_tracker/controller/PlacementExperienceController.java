package com.quizapplication.placement_tracker.controller;

import com.quizapplication.placement_tracker.entity.PlacementExperience;
import com.quizapplication.placement_tracker.service.PlacementExperienceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/placement-experiences")
public class PlacementExperienceController {

    @Autowired
    private PlacementExperienceService service;

    @GetMapping
    public List<PlacementExperience> getAllExperiences() {
        return service.getAllExperiences();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlacementExperience> getExperienceById(@PathVariable String id) {
        return service.getExperienceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PlacementExperience createExperience(@RequestBody PlacementExperience experience) {
        return service.createExperience(experience);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlacementExperience> updateExperience(
            @PathVariable String id,
            @RequestBody PlacementExperience experience) {
        return service.getExperienceById(id)
                .map(existing -> ResponseEntity.ok(service.updateExperience(id, experience)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable String id) {
        return service.getExperienceById(id)
                .map(existing -> {
                    service.deleteExperience(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search/company")
    public List<PlacementExperience> searchByCompany(@RequestParam String name) {
        return service.searchByCompany(name);
    }

    @GetMapping("/search/department")
    public List<PlacementExperience> searchByDepartment(@RequestParam String name) {
        return service.searchByDepartment(name);
    }

    @GetMapping("/filter/result")
    public List<PlacementExperience> filterByResult(@RequestParam String result) {
        return service.getByResult(result);
    }

    @GetMapping("/grouped/company")
    public ResponseEntity<java.util.Map<String, java.util.Map<Integer, List<PlacementExperience>>>> getExperiencesGroupedByCompany() {
        return ResponseEntity.ok(service.getExperiencesGroupedByCompanyAndYear());
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<java.util.Map<Integer, List<PlacementExperience>>> getExperiencesByCompanyGroupedByYear(
            @PathVariable String companyName) {
        return ResponseEntity.ok(service.getExperiencesByCompanyGroupedByYear(companyName));
    }
}
