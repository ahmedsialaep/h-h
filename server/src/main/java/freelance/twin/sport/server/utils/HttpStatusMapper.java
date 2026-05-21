package freelance.twin.sport.server.utils;


import freelance.twin.sport.server.config.ApiRes;
import org.springframework.http.HttpStatus;

public class HttpStatusMapper {

    private HttpStatusMapper() {
    }

    public static HttpStatus mapToHttpStatus(ApiRes.ErrorCode errorCode) {

        return switch (errorCode) {

            // ─── Authentication ───────────────────────────────────────────────
            case ACTIVE_SESSION -> HttpStatus.CONFLICT;

            case SESSION_INVALIDATED,
                 NO_SESSION,
                 INVALID_CREDENTIALS,
                 UNAUTHORIZED ->
                    HttpStatus.UNAUTHORIZED;

            case FORBIDDEN ->
                    HttpStatus.FORBIDDEN;

            case TWO_FA_REQUIRED,
                 TWO_FA_INVALID ->
                    HttpStatus.UNAUTHORIZED;

            // ─── Resources ────────────────────────────────────────────────────
            case NOT_FOUND ->
                    HttpStatus.NOT_FOUND;

            case ALREADY_EXISTS ->
                    HttpStatus.CONFLICT;

            case VALIDATION_ERROR ->
                    HttpStatus.UNPROCESSABLE_ENTITY;

            // ─── Server ───────────────────────────────────────────────────────
            case INTERNAL_ERROR ->
                    HttpStatus.INTERNAL_SERVER_ERROR;

            case BAD_REQUEST ->
                    HttpStatus.BAD_REQUEST;
        };
    }
}
