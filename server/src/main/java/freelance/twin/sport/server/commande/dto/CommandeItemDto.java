package freelance.twin.sport.server.commande.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommandeItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productRef;
    private String productImage;
    private String brandName;

    private Long variantId;
    private String variantSize;
    private String variantColor;
    private int quantity;
    private double unitPrice;
}
