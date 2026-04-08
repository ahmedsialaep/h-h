package freelance.twin.sport.server.commande.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommandeItemRequest {
    private Long productId;
    private Long variantId;
    private int quantity;
}