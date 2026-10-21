package com.aiinterview.coach.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaUploadController {

    @Value("${app.file.storage-path:./uploads}")
    private String storagePath;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit

    @PostMapping("/upload-video")
    public ResponseEntity<?> uploadVideoAnswer(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded video file is empty."));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Video file exceeds maximum allowable size limit of 50MB."));
        }

        String originalFilename = file.getOriginalFilename();
        String extension = ".webm";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        if (!extension.equalsIgnoreCase(".webm") && !extension.equalsIgnoreCase(".mp4")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid video file type. Only .webm and .mp4 formats are supported."));
        }

        try {
            File videoDir = new File(storagePath + "/videos");
            if (!videoDir.exists()) {
                videoDir.mkdirs();
            }

            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path targetPath = Paths.get(storagePath + "/videos/" + uniqueFilename);
            Files.write(targetPath, file.getBytes());

            String relativeFilePath = "uploads/videos/" + uniqueFilename;

            return ResponseEntity.ok(Map.of(
                    "videoFilePath", relativeFilePath,
                    "fileName", uniqueFilename,
                    "fileSize", file.getSize()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to store video file: " + e.getMessage()));
        }
    }
}
