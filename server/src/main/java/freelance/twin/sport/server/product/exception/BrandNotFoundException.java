package freelance.twin.sport.server.product.exception;

import freelance.twin.sport.server.config.ApiRes;

public class BrandNotFoundException extends ProductException {
    public BrandNotFoundException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "BRAND_NOT_FOUND";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.NOT_FOUND;
    }
}
