package com.college.productdev.csrmodule.users;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public List<User> listAll() {
        return repo.findAll();
    }

    @Transactional
    public User upsert(UserUpsertRequest req) {
        var user = repo.findByEmail(req.email()).orElseGet(User::new);
        if (user.getId() == null) {
            user.setEmail(req.email());
        }
        if (req.name() != null && !req.name().isBlank()) user.setName(req.name());
        if (req.username() != null && !req.username().isBlank()) user.setUsername(req.username());
        if (req.password() != null && !req.password().isBlank()) user.setPassword(req.password());
        if (req.profession() != null && !req.profession().isBlank()) user.setProfession(req.profession());
        if (req.role() != null && !req.role().isBlank()) user.setRole(req.role());
        if (req.department() != null && !req.department().isBlank()) user.setDepartment(req.department());
        user.setVerifiedAt(req.verifiedAt() != null ? req.verifiedAt() : LocalDateTime.now());
        return repo.save(user);
    }

    public User login(String usernameOrEmail, String password, String role) {
        String queryRole = "volunteer".equalsIgnoreCase(role) ? "Volunteer" : "Employee";
        var user = repo.findByUsernameOrEmailAndRole(usernameOrEmail, queryRole)
                .orElseThrow(() -> new RuntimeException("User not found or incorrect role"));
        if (user.getPassword() == null || !user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }
}
