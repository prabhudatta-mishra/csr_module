package com.college.productdev.csrmodule.student;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository repo;

    public StudentController(StudentRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Student> findAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> findOne(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Student student) {
        if (student.getId() != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("New student cannot have id");
        }
        if (student.getEmail() == null || student.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
        }
        if (repo.existsByEmail(student.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        Student saved = repo.save(student);
        return ResponseEntity.created(URI.create("/api/students/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Student payload) {
        return repo.findById(id)
                .map(existing -> {
                    if (payload.getName() != null) existing.setName(payload.getName());
                    if (payload.getEmail() != null) {
                        if (!payload.getEmail().equals(existing.getEmail()) && repo.existsByEmail(payload.getEmail())) {
                            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
                        }
                        existing.setEmail(payload.getEmail());
                    }
                    Student saved = repo.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
