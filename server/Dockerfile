# 1 Build stage - Use Maven w JDK 21
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy and build source
COPY src src
RUN mvn clean package -DskipTests

# 2 Runtime stage - Use JDK 21 only
FROM eclipse-temurin:21-jdk-jammy

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy WAR instead of JAR
COPY --from=build /app/target/*.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

EXPOSE 8080

# Run Spring Boot WAR directly
CMD ["java", "-jar", "app.jar"]
