package com.college.productdev.csrmodule.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findTop200ByUserEmailOrderByOccurredAtDesc(String userEmail);
}
