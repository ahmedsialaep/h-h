package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.config.ApiRes;

public class FailedCredentialsException extends UserException {
    public FailedCredentialsException(String message) {
        super("Bad Credentials: "+message);
    }
    @Override
    public String getErrorCode() {
        return "BAD_CREDENTIALS";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.INTERNAL_ERROR;
    }
}
