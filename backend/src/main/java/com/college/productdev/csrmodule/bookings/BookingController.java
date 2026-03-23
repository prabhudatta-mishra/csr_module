package com.college.productdev.csrmodule.bookings;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class BookingController {
    private final BookingRepository repo;

    public BookingController(BookingRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Booking> list() {
        return repo.findAll();
    }

    @PostMapping
    public ResponseEntity<Booking> create(@RequestBody Booking body) {
        return ResponseEntity.ok(repo.save(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> patch) {
        return repo.findById(id).map(b -> {
            if (patch.containsKey("status")) b.setStatus((String) patch.get("status"));
            return ResponseEntity.ok(repo.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
