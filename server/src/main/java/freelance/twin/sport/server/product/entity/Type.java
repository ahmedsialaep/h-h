package freelance.twin.sport.server.product.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Table(name = "types")
@Entity
public class Type {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type_name;

    private String description;

    @OneToMany(mappedBy = "productType")
    @JsonIgnore
    private List<Product> product;
}
