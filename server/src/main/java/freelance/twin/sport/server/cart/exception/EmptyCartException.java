package freelance.twin.sport.server.cart.exception;

import freelance.twin.sport.server.config.ApiRes;

public class EmptyCartException extends CartException {
    public EmptyCartException(String message) {
        super(message);
    }


    @Override
    public String getErrorCode() {
        return "PANIER_VIDE_ERROR";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.VALIDATION_ERROR;
    }
}
