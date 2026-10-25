package com.example.privatechat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AppUserRepository userRepository;
    private final ChatMessageRepository messageRepository;

    public ChatController(AppUserRepository userRepository, ChatMessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    @GetMapping("/users")
    public List<String> getUsers(Principal principal) {
        return userRepository.findAll().stream()
                .map(AppUser::getUsername)
                .filter(username -> !username.equals(principal.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/history/{recipient}")
    public List<ChatMessage> getHistory(@PathVariable String recipient, Principal principal) {
        return messageRepository.findChatHistory(principal.getName(), recipient);
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody SendMessageRequest request, Principal principal) {
        String recipient = request.recipient();
        String content = request.content().trim();

        if (recipient.equals(principal.getName())) {
            return ResponseEntity.badRequest().body("You cannot send a message to yourself.");
        }
        if (userRepository.findByUsername(recipient).isEmpty()) {
            return ResponseEntity.badRequest().body("Recipient does not exist.");
        }

        ChatMessage message = new ChatMessage(principal.getName(), recipient, content);
        messageRepository.save(message);
        return ResponseEntity.ok(message);
    }

    public record SendMessageRequest(
            @NotBlank
            @Pattern(regexp = "^[A-Za-z0-9_.-]{3,32}$", message = "Recipient username is invalid.")
            String recipient,
            @NotBlank
            @Size(max = 2000, message = "Message must be 2000 characters or fewer.")
            String content) {
    }
}
