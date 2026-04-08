package freelance.twin.sport.server.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "product_variants")
public class ProductVars {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String size;

    private String color;

    private int soldQuantity = 0;

    private int availableQuantity = 0;

    private int stock;

}