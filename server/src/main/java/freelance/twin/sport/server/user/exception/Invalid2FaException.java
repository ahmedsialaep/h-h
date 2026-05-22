package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.config.ApiRes;

public class Invalid2FaException extends UserException{

    public Invalid2FaException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "INVALID_2FA";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.TWO_FA_INVALID;
    }
}
