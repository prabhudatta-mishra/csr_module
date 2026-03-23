package com.college.productdev.csrmodule.audit;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_events", indexes = {
        @Index(name = "idx_audit_email", columnList = "userEmail"),
        @Index(name = "idx_audit_action", columnList = "action")
})
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200)
    private String userEmail;

    @Column(length = 64, nullable = false)
    private String action; // LOGIN, VIEW_PAGE, BOOK_PROJECT, etc.

    @Column(length = 64)
    private String entityType; // PROJECT, PAGE, etc.

    private Long entityId; // optional

    @Column(length = 2000)
    private String details; // optional JSON/text

    @Column(nullable = false)
    private LocalDateTime occurredAt = LocalDateTime.now();

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }
}
