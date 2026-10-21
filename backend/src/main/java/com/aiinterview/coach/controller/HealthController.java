package com.aiinterview.coach.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AI Mock Interview Platform Backend");
        response.put("timestamp", System.currentTimeMillis());

        try (Connection connection = dataSource.getConnection()) {
            response.put("database", "CONNECTED");
            response.put("databaseProduct", connection.getMetaData().getDatabaseProductName());
            response.put("databaseCatalog", connection.getCatalog());
        } catch (Exception e) {
            response.put("database", "DISCONNECTED");
            response.put("databaseError", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
