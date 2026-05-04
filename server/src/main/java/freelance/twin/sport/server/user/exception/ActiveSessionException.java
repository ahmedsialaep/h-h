package freelance.twin.sport.server.user.exception;


import freelance.twin.sport.server.config.ApiRes;

public class ActiveSessionException extends UserException {
    public ActiveSessionException(String message) {
        super(message);
    }
    @Override
    public String getErrorCode() {
        return "ACTIVE_SESSION";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.ACTIVE_SESSION;
    }
}
