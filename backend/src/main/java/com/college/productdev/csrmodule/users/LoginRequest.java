package com.college.productdev.csrmodule.users;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank String usernameOrEmail,
    @NotBlank String password,
    String role
) {}
