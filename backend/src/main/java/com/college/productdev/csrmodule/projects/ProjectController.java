package com.college.productdev.csrmodule.projects;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class ProjectController {
    private final ProjectRepository repo;

    public ProjectController(ProjectRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Project> list() {
        return repo.findAll();
    }

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody Project body) {
        body.setId(null);
        return ResponseEntity.ok(repo.save(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> patch) {
        return repo.findById(id).map(p -> {
            if (patch.containsKey("projectName")) p.setProjectName((String) patch.get("projectName"));
            if (patch.containsKey("department")) p.setDepartment((String) patch.get("department"));
            if (patch.containsKey("status")) p.setStatus((String) patch.get("status"));
            if (patch.containsKey("description")) p.setDescription((String) patch.get("description"));
            if (patch.containsKey("location")) p.setLocation((String) patch.get("location"));
            if (patch.containsKey("budget") && patch.get("budget") != null)
                p.setBudget(((Number) patch.get("budget")).longValue());
            if (patch.containsKey("usedBudget") && patch.get("usedBudget") != null)
                p.setUsedBudget(((Number) patch.get("usedBudget")).longValue());
            if (patch.containsKey("seats") && patch.get("seats") != null)
                p.setSeats(((Number) patch.get("seats")).intValue());
            if (patch.containsKey("startDate")) p.setStartDate((String) patch.get("startDate"));
            if (patch.containsKey("endDate")) p.setEndDate((String) patch.get("endDate"));
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
