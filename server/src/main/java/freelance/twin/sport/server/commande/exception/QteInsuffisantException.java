package freelance.twin.sport.server.commande.exception;

import freelance.twin.sport.server.config.ApiRes;

public class QteInsuffisantException extends CommandeException {
    public QteInsuffisantException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "QTE_NOT_ENOUGH";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.VALIDATION_ERROR;
    }
}
