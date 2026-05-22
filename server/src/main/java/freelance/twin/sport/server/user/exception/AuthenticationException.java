package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.config.ApiRes;

public class AuthenticationException extends UserException {
    public AuthenticationException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "AUTH_FAILED";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.INTERNAL_ERROR;
    }
}
