package com.gitinbits.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Public health check endpoint used by uptime monitors and keep-alive pings
 * to prevent Render free-tier instance sleep.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "gitinbits-backend",
                "timestamp", Instant.now().toString()
        ));
    }
}
