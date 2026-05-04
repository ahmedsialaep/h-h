package freelance.twin.sport.server.user.exception;


import freelance.twin.sport.server.config.ApiRes;
import freelance.twin.sport.server.excepion.JmxSportException;

public class InvalidSession extends JmxSportException {
    public InvalidSession(String message) {
        super(message);
    }
    @Override
    public String getErrorCode() {
        return "SESSION_INVALIDATED";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.ACTIVE_SESSION;
    }
}
