package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.config.ApiRes;

public class TwoFaCodeNotFoundException extends UserException {
    public TwoFaCodeNotFoundException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "TWO_FA_CODE_NOT_FOUND";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.NOT_FOUND;
    }
}
