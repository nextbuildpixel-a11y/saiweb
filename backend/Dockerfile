# Multi-stage Dockerfile for Spring Boot Backend (Root Context)
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml from backend directory and pre-fetch dependencies
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy backend source code and package application jar
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create directory for persistent local H2 data & uploads
RUN mkdir -p /app/data /app/uploads

# Copy built app jar from builder stage
COPY --from=builder /app/target/app.jar app.jar

# Dynamic port for Render / Railway ($PORT)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
