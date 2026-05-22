package freelance.twin.sport.server.product.exception;

import freelance.twin.sport.server.config.ApiRes;

public class ProductNotFoundException extends ProductException {
    public ProductNotFoundException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return "PRODUCT_NOT_FOUND";
    }

    @Override
    public ApiRes.ErrorCode getApiErrorCode() {
        return ApiRes.ErrorCode.NOT_FOUND;
    }
}
