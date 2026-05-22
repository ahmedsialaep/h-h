package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.config.ApiRes;

public class UserNotFoundException extends UserException {
    public UserNotFoundException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "USER_NOT_FOUND";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.NOT_FOUND;
    }
}
