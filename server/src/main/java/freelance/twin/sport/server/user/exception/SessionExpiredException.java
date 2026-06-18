package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.config.ApiRes;

public class SessionExpiredException extends UserException {
  public SessionExpiredException(String message) {
    super(message);
  }
    @Override
    public String getErrorCode() {
        return "SESSION_EXPIRED";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.SESSION_INVALIDATED;
    }
}
