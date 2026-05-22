package freelance.twin.sport.server.commande.exception;

import freelance.twin.sport.server.config.ApiRes;

public class EmptyRequestException extends CommandeException {
    public EmptyRequestException(String message) {
        super(message);
    }


    @Override
    public String getErrorCode() {
        return "COMMANDE_EMPTY_REQUEST";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.VALIDATION_ERROR;
    }
}
