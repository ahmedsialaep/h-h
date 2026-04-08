package freelance.twin.sport.server.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Table(name = "products")
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", columnDefinition = "varchar")
    private String name;

    @Column(name = "ref", unique = true, nullable = false, columnDefinition = "varchar")
    private String ref;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genre gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Categorie categorie;

    @Column(nullable = false)
    private double price;

    private Double originalPrice;

    private LocalDateTime createdAt;

    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)

    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_type_id", nullable = false)
    private Type productType;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVars> variants = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    private boolean newArrival;

    private boolean marketVisible;
    @Column(name = "average_rating")
    private double averageRating;
}