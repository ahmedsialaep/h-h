package freelance.twin.sport.server.cart.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productRef;
    private double productPrice;
    private String productImage;
    private String brandName;

    private Long variantId;
    private String variantSize;
    private String variantColor;
    private int availableQte;
    private int quantity;
}
