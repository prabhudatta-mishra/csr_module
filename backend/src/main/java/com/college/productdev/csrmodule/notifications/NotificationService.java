package com.college.productdev.csrmodule.notifications;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public Notification save(Notification n) {
        return repo.save(n);
    }

    public List<Notification> latestFor(String email) {
        if (email == null || email.isBlank()) {
            return repo.findTop100ByUserEmailIsNullOrderByCreatedAtDesc();
        }
        return repo.findTop100ByUserEmailOrderByCreatedAtDesc(email);
    }

    public void markAllRead(String email) {
        var list = latestFor(email);
        for (var n : list) {
            n.setReadFlag(true);
        }
        repo.saveAll(list);
    }
}
