package freelance.twin.sport.server.cart.entity;

import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "cart_items", indexes = {

        @Index(name = "idx_item_variant_id", columnList = "variant_id"),
        @Index(name = "idx_cart_variant_id", columnList = "cart_id,variant_id")

})
@Entity
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVars variant;

    private int quantity;
}
