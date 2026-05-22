package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.config.ApiRes;

public class TwoFaRequired extends UserException {
    public TwoFaRequired(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "REQUIRED_TWO_FA_INVALID";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.TWO_FA_REQUIRED;
    }
}
