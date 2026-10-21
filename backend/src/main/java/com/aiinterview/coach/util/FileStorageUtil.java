package com.aiinterview.coach.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class FileStorageUtil {

    @Value("${app.file.storage-path:./uploads}")
    private String storagePath;

    public String storeResumeFile(MultipartFile file) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        
        int i = originalFilename.lastIndexOf('.');
        if (i >= 0) {
            extension = originalFilename.substring(i);
        }

        if (!extension.equalsIgnoreCase(".pdf") && !extension.equalsIgnoreCase(".docx") && !extension.equalsIgnoreCase(".doc")) {
            throw new IllegalArgumentException("Only PDF and DOCX resume file formats are accepted.");
        }

        Path targetDir = Paths.get(storagePath, "resumes").toAbsolutePath().normalize();
        Files.createDirectories(targetDir);

        String newFilename = UUID.randomUUID().toString() + extension;
        Path targetLocation = targetDir.resolve(newFilename);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return targetLocation.toString();
    }
}
