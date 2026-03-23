package com.college.productdev.csrmodule.projects;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200, nullable = false)
    private String projectName;

    @Column(length = 100)
    private String department;

    private Long budget;
    private Long usedBudget;

    @Column(length = 20)
    private String startDate;

    @Column(length = 20)
    private String endDate;

    @Column(length = 30)
    private String status = "Planned";

    @Column(length = 1000)
    private String description;

    @Column(length = 200)
    private String location;

    private Double latitude;
    private Double longitude;
    private Integer seats;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Long getBudget() { return budget; }
    public void setBudget(Long budget) { this.budget = budget; }
    public Long getUsedBudget() { return usedBudget; }
    public void setUsedBudget(Long usedBudget) { this.usedBudget = usedBudget; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
