package com.college.productdev.csrmodule.users;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record UserUpsertRequest(
        String name,
        String username,
        String password,
        String profession,
        String role,
        String department,
        @NotBlank @Email String email,
        LocalDateTime verifiedAt
) {}
