package freelance.twin.sport.server.product.dto;

import freelance.twin.sport.server.product.entity.Categorie;
import freelance.twin.sport.server.product.entity.Genre;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductDto {
    private Long id;
    private String name;
    private String ref;
    private Genre gender;
    private Categorie categorie;
    private double price;
    private Double originalPrice;
    private String image;
    private Long brandId;
    private String brandName;
    private LocalDateTime createdAt;
    private Long typeId;
    private String typeName;
    private List<ProductVariantDTO> variants;
    private String description;
    private boolean newArrival;
    private boolean marketVisible;
    private double averageRating;
}
