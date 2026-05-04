package freelance.twin.sport.server.user.exception;

import freelance.twin.sport.server.excepion.JmxSportException;

public abstract class UserException extends JmxSportException {
    public UserException(String message) {
        super(message);
    }
}
