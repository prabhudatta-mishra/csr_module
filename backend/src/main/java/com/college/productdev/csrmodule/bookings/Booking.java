package com.college.productdev.csrmodule.bookings;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booked_events")
public class Booking {
    @Id
    @Column(length = 36)
    private String id;        // UUID string from frontend

    private Long eventId;     // project or event id
    private Long userId;

    @Column(length = 150)
    private String name;

    @Column(length = 200)
    private String email;

    @Column(length = 150)
    private String profession;

    @Column(length = 30)
    private String status = "Pending";

    @Column(length = 30)
    private String bookingType = "Event"; // "Event" or "Project"

    private LocalDateTime bookedAt = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBookingType() { return bookingType; }
    public void setBookingType(String bookingType) { this.bookingType = bookingType; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
