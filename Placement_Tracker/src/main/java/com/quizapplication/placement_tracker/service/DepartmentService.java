package com.quizapplication.placement_tracker.service;

import com.quizapplication.placement_tracker.dto.DepartmentDTO;
import com.quizapplication.placement_tracker.entity.Department;
import com.quizapplication.placement_tracker.entity.DepartmentGroup;
import com.quizapplication.placement_tracker.exception.ResourceAlreadyExistsException;
import com.quizapplication.placement_tracker.exception.ResourceNotFoundException;
import com.quizapplication.placement_tracker.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        if (departmentRepository.existsByDepartmentName(departmentDTO.getDepartmentName())) {
            throw new ResourceAlreadyExistsException("Department with name '" + departmentDTO.getDepartmentName() + "' already exists");
        }
        if (departmentRepository.existsByDepartmentCode(departmentDTO.getDepartmentCode())) {
            throw new ResourceAlreadyExistsException("Department with code '" + departmentDTO.getDepartmentCode() + "' already exists");
        }

        Department department = new Department();
        department.setDepartmentName(departmentDTO.getDepartmentName());
        department.setDepartmentCode(departmentDTO.getDepartmentCode());
        department.setDescription(departmentDTO.getDescription());
        department.setDepartmentGroup(departmentDTO.getDepartmentGroup());

        Department savedDepartment = departmentRepository.save(department);
        return convertToDTO(savedDepartment);
    }

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DepartmentDTO getDepartmentById(String id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return convertToDTO(department);
    }

    public List<DepartmentDTO> getRelatedDepartments(String departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
        
        return departmentRepository.findByDepartmentGroup(department.getDepartmentGroup()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DepartmentDTO> getDepartmentsByGroup(DepartmentGroup group) {
        return departmentRepository.findByDepartmentGroup(group).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDTO updateDepartment(String id, DepartmentDTO departmentDTO) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!department.getDepartmentName().equals(departmentDTO.getDepartmentName()) &&
                departmentRepository.existsByDepartmentName(departmentDTO.getDepartmentName())) {
            throw new ResourceAlreadyExistsException("Department with name '" + departmentDTO.getDepartmentName() + "' already exists");
        }

        department.setDepartmentName(departmentDTO.getDepartmentName());
        department.setDepartmentCode(departmentDTO.getDepartmentCode());
        department.setDescription(departmentDTO.getDescription());
        department.setDepartmentGroup(departmentDTO.getDepartmentGroup());

        Department updatedDepartment = departmentRepository.save(department);
        return convertToDTO(updatedDepartment);
    }

    @Transactional
    public void deleteDepartment(String id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentDTO convertToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setDepartmentName(department.getDepartmentName());
        dto.setDepartmentCode(department.getDepartmentCode());
        dto.setDescription(department.getDescription());
        dto.setDepartmentGroup(department.getDepartmentGroup());
        return dto;
    }
}
