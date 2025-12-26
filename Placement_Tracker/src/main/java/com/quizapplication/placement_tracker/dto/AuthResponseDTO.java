package com.quizapplication.placement_tracker.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication Response")
public class AuthResponseDTO {

    @Schema(description = "Status message", example = "Login successful")
    private String message;

    @Schema(description = "User details")
    private UserDTO user;

    @Schema(description = "Session token (for future JWT implementation)", example = "session-token-123")
    private String token;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String message, UserDTO user) {
        this.message = message;
        this.user = user;
    }

    public AuthResponseDTO(String message, UserDTO user, String token) {
        this.message = message;
        this.user = user;
        this.token = token;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
