package com.college.productdev.csrmodule.assignments;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeProjectRepository extends JpaRepository<EmployeeProject, Long> {
    List<EmployeeProject> findByUserId(Long userId);
    void deleteByUserIdAndProjectId(Long userId, Long projectId);
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
    List<EmployeeProject> findByProjectId(Long projectId);
}
