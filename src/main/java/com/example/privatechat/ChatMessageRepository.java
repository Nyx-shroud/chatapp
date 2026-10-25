package com.example.privatechat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender = :u1 AND m.recipient = :u2) OR " +
           "(m.sender = :u2 AND m.recipient = :u1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("u1") String user1, @Param("u2") String user2);
}
