package freelance.twin.sport.server.product.exception;

import freelance.twin.sport.server.config.ApiRes;

public class VariantNotFoundException extends ProductException {
    public VariantNotFoundException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "VARIANT_NOT_FOUND";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.NOT_FOUND;
    }
}
