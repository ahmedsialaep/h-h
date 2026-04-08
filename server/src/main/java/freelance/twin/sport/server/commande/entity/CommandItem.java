package freelance.twin.sport.server.commande.entity;

import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "commande_items")
public class CommandItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVars variant;

    private int quantity;
    private double unitPrice;
}
