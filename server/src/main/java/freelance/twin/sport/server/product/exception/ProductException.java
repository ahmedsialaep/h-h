package freelance.twin.sport.server.product.exception;

import freelance.twin.sport.server.excepion.JmxSportException;

public abstract class ProductException extends JmxSportException {
    public ProductException(String message) {
        super(message);
    }
}
