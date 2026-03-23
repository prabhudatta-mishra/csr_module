package com.college.productdev.csrmodule.users;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class UserController {
    private final UserService service;
    private final UserRepository repo;

    public UserController(UserService service, UserRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<User>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PostMapping("/upsert")
    public ResponseEntity<?> upsert(@Valid @RequestBody UserUpsertRequest body) {
        var saved = service.upsert(body);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest body) {
        try {
            var user = service.login(body.usernameOrEmail(), body.password(), body.role());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() { return ResponseEntity.ok("ok"); }

    @DeleteMapping("/by-email")
    public ResponseEntity<?> deleteByEmail(@RequestParam("email") String email) {
        if (email == null || email.isBlank()) return ResponseEntity.badRequest().body("email required");
        if (!repo.existsByEmail(email)) return ResponseEntity.notFound().build();
        repo.deleteByEmail(email);
        return ResponseEntity.noContent().build();
    }
}
