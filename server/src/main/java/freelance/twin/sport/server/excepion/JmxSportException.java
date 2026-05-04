package freelance.twin.sport.server.excepion;

import freelance.twin.sport.server.config.ApiRes;

public abstract class JmxSportException extends RuntimeException {

    protected JmxSportException(String message) {
        super(message);
    }

    public abstract String getErrorCode();

    public abstract ApiRes.ErrorCode getApiErrorCode();


}
