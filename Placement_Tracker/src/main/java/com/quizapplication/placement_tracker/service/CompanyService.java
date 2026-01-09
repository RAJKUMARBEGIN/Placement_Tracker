package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.dto.CompanyDTO;
import com.quizapplication.placement_tracker.entity.Company;
import com.quizapplication.placement_tracker.entity.User;
import com.quizapplication.placement_tracker.exception.ResourceAlreadyExistsException;
import com.quizapplication.placement_tracker.exception.ResourceNotFoundException;
import com.quizapplication.placement_tracker.repository.CompanyRepository;
import com.quizapplication.placement_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CompanyDTO createCompany(CompanyDTO companyDTO, String userId) {
        // Check if company already exists
        if (companyRepository.existsByCompanyNameIgnoreCase(companyDTO.getCompanyName())) {
            throw new ResourceAlreadyExistsException("Company '" + companyDTO.getCompanyName() + "' already exists");
        }

        User createdBy = null;
        if (userId != null) {
            createdBy = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        }

        Company company = new Company();
        company.setCompanyName(companyDTO.getCompanyName());
        company.setDescription(companyDTO.getDescription());
        company.setIndustry(companyDTO.getIndustry());
        company.setWebsite(companyDTO.getWebsite());
        company.setLogoUrl(companyDTO.getLogoUrl());
        company.setHeadquarters(companyDTO.getHeadquarters());
        company.setCreatedById(createdBy.getId());

        Company savedCompany = companyRepository.save(company);
        return convertToDTO(savedCompany);
    }

    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CompanyDTO getCompanyById(String id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return convertToDTO(company);
    }

    public CompanyDTO getCompanyByName(String name) {
        Company company = companyRepository.findByCompanyNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with name: " + name));
        return convertToDTO(company);
    }

    public List<CompanyDTO> searchCompanies(String query) {
        return companyRepository.findByCompanyNameContainingIgnoreCase(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public boolean companyExists(String companyName) {
        return companyRepository.existsByCompanyNameIgnoreCase(companyName);
    }

    @Transactional
    public CompanyDTO updateCompany(String id, CompanyDTO companyDTO) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        if (companyDTO.getCompanyName() != null && !companyDTO.getCompanyName().equalsIgnoreCase(company.getCompanyName())) {
            if (companyRepository.existsByCompanyNameIgnoreCase(companyDTO.getCompanyName())) {
                throw new ResourceAlreadyExistsException("Company '" + companyDTO.getCompanyName() + "' already exists");
            }
            company.setCompanyName(companyDTO.getCompanyName());
        }

        if (companyDTO.getDescription() != null) company.setDescription(companyDTO.getDescription());
        if (companyDTO.getIndustry() != null) company.setIndustry(companyDTO.getIndustry());
        if (companyDTO.getWebsite() != null) company.setWebsite(companyDTO.getWebsite());
        if (companyDTO.getLogoUrl() != null) company.setLogoUrl(companyDTO.getLogoUrl());
        if (companyDTO.getHeadquarters() != null) company.setHeadquarters(companyDTO.getHeadquarters());

        Company updatedCompany = companyRepository.save(company);
        return convertToDTO(updatedCompany);
    }

    @Transactional
    public void deleteCompany(String id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    private CompanyDTO convertToDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setCompanyName(company.getCompanyName());
        dto.setDescription(company.getDescription());
        dto.setIndustry(company.getIndustry());
        dto.setWebsite(company.getWebsite());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setHeadquarters(company.getHeadquarters());
        dto.setCreatedAt(company.getCreatedAt());
        dto.setCreatedById(company.getCreatedById());
        if (company.getInterviewExperienceIds() != null) {
            dto.setExperienceCount(company.getInterviewExperienceIds().size());
        } else {
            dto.setExperienceCount(0);
        }
        return dto;
    }
}
