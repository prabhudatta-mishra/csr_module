package com.college.productdev.csrmodule.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE (u.email = :usernameOrEmail OR u.username = :usernameOrEmail) AND u.role = :role")
    Optional<User> findByUsernameOrEmailAndRole(@Param("usernameOrEmail") String usernameOrEmail, @Param("role") String role);

    boolean existsByEmail(String email);
    void deleteByEmail(String email);
}
