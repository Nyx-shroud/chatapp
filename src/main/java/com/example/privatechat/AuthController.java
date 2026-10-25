package com.example.privatechat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String USERNAME_PATTERN = "^[A-Za-z0-9_.-]{3,32}$";

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest request) {
        String username = request.username().trim();

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(409).body("Username already taken.");
        }

        AppUser user = new AppUser(username, passwordEncoder.encode(request.password()));
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(409).body("Username already taken.");
        }
        return ResponseEntity.ok("Registration successful.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of("username", principal.getName()));
    }

    public record RegistrationRequest(
            @NotBlank
            @Pattern(regexp = USERNAME_PATTERN, message = "Username must be 3-32 characters and use letters, numbers, dots, underscores, or hyphens.")
            String username,
            @NotBlank
            @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters.")
            String password) {
    }
}
