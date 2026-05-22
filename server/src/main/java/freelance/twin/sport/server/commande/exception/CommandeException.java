package freelance.twin.sport.server.commande.exception;

import freelance.twin.sport.server.config.ApiRes;
import freelance.twin.sport.server.excepion.JmxSportException;

public abstract class CommandeException extends JmxSportException {
    public CommandeException(String message) {
        super(message);
    }


}
