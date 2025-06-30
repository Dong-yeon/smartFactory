package com.smartFactory.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Slf4j
@Configuration
public class DateTimeConfig {

    private static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT);

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        JavaTimeModule module = new JavaTimeModule();
        
        // For serialization (Java object to JSON)
        module.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(FORMATTER));
        
        // For deserialization (JSON to Java object)
        module.addDeserializer(LocalDateTime.class, new StdDeserializer<LocalDateTime>(LocalDateTime.class) {
            @Override
            public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) 
                    throws IOException, JsonProcessingException {
                String dateString = p.getText().trim();
                log.info("Attempting to parse date: {}", dateString);
                
                // Handle null or empty string
                if (dateString == null || dateString.isEmpty()) {
                    log.warn("Empty or null date string provided");
                    return null;
                }
                
                try {
                    // Try to parse with our format first (yyyy-MM-dd HH:mm)
                    LocalDateTime result = LocalDateTime.parse(dateString, FORMATTER);
                    log.debug("Successfully parsed date in format '{}': {}", DATE_TIME_FORMAT, result);
                    return result;
                } catch (DateTimeParseException e1) {
                    try {
                        // If that fails, try to parse as ISO format (yyyy-MM-dd'T'HH:mm:ss)
                        LocalDateTime result = LocalDateTime.parse(dateString);
                        log.debug("Successfully parsed date in ISO format: {}", result);
                        return result;
                    } catch (DateTimeParseException e2) {
                        try {
                            // Try to handle date-only format (yyyy-MM-dd) by appending time
                            LocalDateTime result = LocalDateTime.parse(
                                dateString + "T00:00:00"
                            );
                            log.debug("Successfully parsed date-only string by appending time: {}", result);
                            return result;
                        } catch (DateTimeParseException e3) {
                            String errorMsg = String.format(
                                "Failed to parse date: %s. Expected formats: '%s', ISO format, or date-only (yyyy-MM-dd)", 
                                dateString, DATE_TIME_FORMAT);
                            log.error(errorMsg, e3);
                            throw new IOException(errorMsg, e3);
                        }
                    }
                }
            }
        });
        
        ObjectMapper objectMapper = Jackson2ObjectMapperBuilder.json()
                .modules(module)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
                
        objectMapper.findAndRegisterModules();
        return objectMapper;
    }
}
