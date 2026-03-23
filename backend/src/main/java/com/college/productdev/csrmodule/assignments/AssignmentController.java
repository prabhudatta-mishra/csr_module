package com.college.productdev.csrmodule.assignments;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class AssignmentController {
    private final EmployeeProjectRepository repo;

    public AssignmentController(EmployeeProjectRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Long>> list() {
        return repo.findAll().stream()
            .map(ep -> Map.of("userId", ep.getUserId(), "projectId", ep.getProjectId()))
            .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public List<Long> projectsForUser(@PathVariable Long userId) {
        return repo.findByUserId(userId).stream()
            .map(EmployeeProject::getProjectId)
            .collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> assign(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        Long projectId = body.get("projectId");
        if (userId == null || projectId == null) return ResponseEntity.badRequest().body("userId and projectId required");
        if (!repo.existsByUserIdAndProjectId(userId, projectId)) {
            repo.save(new EmployeeProject(userId, projectId));
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<?> unassign(@RequestParam Long userId, @RequestParam Long projectId) {
        repo.deleteByUserIdAndProjectId(userId, projectId);
        return ResponseEntity.noContent().build();
    }
}
