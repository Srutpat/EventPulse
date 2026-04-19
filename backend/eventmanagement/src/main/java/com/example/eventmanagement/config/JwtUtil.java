package com.example.eventmanagement.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Secret key — set JWT_SECRET env var in production (min 32 chars)
    @Value("${JWT_SECRET:eventpulse-super-secret-key-change-in-production-2025}")
    private String secret;

    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L; // 24 hours

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /** Generate JWT containing userId, email, role */
    public String generate(Long userId, String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role",   role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Validate and parse claims. Throws if invalid/expired. */
    public Claims validate(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /** Extract email (subject) */
    public String getEmail(String token) { return validate(token).getSubject(); }

    /** Extract role claim */
    public String getRole(String token) { return validate(token).get("role", String.class); }

    /** Extract userId claim */
    public Long getUserId(String token) {
        Object id = validate(token).get("userId");
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof Long)    return (Long) id;
        return Long.parseLong(id.toString());
    }

    public boolean isValid(String token) {
        try { validate(token); return true; }
        catch (Exception e) { return false; }
    }
}