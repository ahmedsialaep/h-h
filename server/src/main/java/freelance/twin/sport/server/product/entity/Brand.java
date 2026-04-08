package freelance.twin.sport.server.product.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Table(name = "brands")
@Entity
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "brand_name", columnDefinition = "varchar")
    private String brand_name;

    private String brand_img;

    private String description;

    @OneToMany(mappedBy = "brand")
    @JsonIgnore
    private List<Product> product;
}
