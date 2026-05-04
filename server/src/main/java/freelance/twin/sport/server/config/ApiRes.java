package freelance.twin.sport.server.config;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiRes<T> {

    private boolean success;
    private T data;
    private Error error;

    // ─── Static factories ─────────────────────────────────────────────────────

    public static <T> ApiRes<T> ok(T data) {
        ApiRes<T> res = new ApiRes<>();
        res.success = true;
        res.data = data;
        return res;
    }

    public static <T> ApiRes<T> ok() {
        ApiRes<T> res = new ApiRes<>();
        res.success = true;
        return res;
    }

    public static <T> ApiRes<T> fail(ErrorCode code, String message) {
        ApiRes<T> res = new ApiRes<>();
        res.success = false;
        res.error = new Error(code.name(), message);
        return res;
    }

    public static <T> ApiRes<T> fail(ErrorCode code, String message, Object details) {
        ApiRes<T> res = new ApiRes<>();
        res.success = false;
        res.error = new Error(code.name(), message, details);
        return res;
    }

    // ─── Getters ──────────────────────────────────────────────────────────────

    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public Error getError() { return error; }

    // ─── Error payload ────────────────────────────────────────────────────────

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Error {
        private final String code;
        private final String message;
        private final Object details;

        public Error(String code, String message) {
            this(code, message, null);
        }

        public Error(String code, String message, Object details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }

        public String getCode() { return code; }
        public String getMessage() { return message; }
        public Object getDetails() { return details; }
    }

    // ─── Error codes ──────────────────────────────────────────────────────────

    public enum ErrorCode {
        // Auth
        ACTIVE_SESSION,
        SESSION_INVALIDATED,
        NO_SESSION,
        INVALID_CREDENTIALS,
        UNAUTHORIZED,
        FORBIDDEN,
        TWO_FA_REQUIRED,
        TWO_FA_INVALID,

        // Resources
        NOT_FOUND,
        ALREADY_EXISTS,
        VALIDATION_ERROR,

        // Server
        INTERNAL_ERROR,
        BAD_REQUEST,
    }
}
