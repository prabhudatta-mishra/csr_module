package com.college.productdev.csrmodule.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@RestController
@RequestMapping("/api/notify")
@CrossOrigin(origins = "http://localhost:4200")
public class EmailController {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @PostMapping("/employee-welcome")
    public ResponseEntity<?> sendWelcome(@RequestBody Map<String, String> body) {
        String to = body.getOrDefault("email", "");
        String name = body.getOrDefault("name", "");
        if (to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email is required"));
        }
        String subject = "Welcome to CSR Program";
        String text = "Hi " + (name.isBlank() ? "there" : name) + ",\n\n" +
                "Welcome to our Corporate Social Responsibility program! " +
                "You have been added to the CSR system. We will share your project assignments and next steps shortly.\n\n" +
                "Best regards,\nCSR Team";
        SimpleMailMessage msg = new SimpleMailMessage();
        if (fromAddress != null && !fromAddress.isBlank()) {
            msg.setFrom(fromAddress);
        }
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        try {
            mailSender.send(msg);
            return ResponseEntity.ok(Map.of("status", "sent"));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of("error", ex.getMessage()));
        }
    }
}
