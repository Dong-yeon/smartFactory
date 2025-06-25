package com.smartFactory.common.exception;

import lombok.Getter;
import java.util.List;

@Getter
public class ErrorResponse {
    private final String message;
    private final List<String> errors;

    public ErrorResponse(String message) {
        this.message = message;
        this.errors = null;
    }

    public ErrorResponse(String message, List<String> errors) {
        this.message = message;
        this.errors = errors;
    }
}
