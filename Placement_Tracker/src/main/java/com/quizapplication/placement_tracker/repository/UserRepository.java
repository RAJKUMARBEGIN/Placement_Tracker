package com.quizapplication.placement_tracker.repository;

import com.quizapplication.placement_tracker.entity.User;
import com.quizapplication.placement_tracker.entity.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByDepartmentId(String departmentId);
    List<User> findByRoleAndDepartmentId(UserRole role, String departmentId);
    List<User> findByPlacedCompanyContainingIgnoreCase(String companyName);
    List<User> findByRoleAndIsApproved(UserRole role, Boolean isApproved);
    List<User> findByRoleAndDepartmentIdAndIsApproved(UserRole role, String departmentId, Boolean isApproved);
    Optional<User> findByApprovalToken(String approvalToken);
}
