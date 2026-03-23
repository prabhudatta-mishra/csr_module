package com.college.productdev.csrmodule.audit;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {
    private final AuditRepository repo;

    public AuditService(AuditRepository repo) {
        this.repo = repo;
    }

    public AuditEvent save(AuditEvent e) { return repo.save(e); }

    public List<AuditEvent> latestFor(String email) { return repo.findTop200ByUserEmailOrderByOccurredAtDesc(email); }
}
