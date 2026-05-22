package freelance.twin.sport.server.cart.exception;

import freelance.twin.sport.server.config.ApiRes;
import freelance.twin.sport.server.excepion.JmxSportException;

public abstract class CartException extends JmxSportException {
    public CartException(String message) {
        super(message);
    }

}
