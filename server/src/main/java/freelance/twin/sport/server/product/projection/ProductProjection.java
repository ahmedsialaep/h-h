package freelance.twin.sport.server.product.projection;

import freelance.twin.sport.server.product.entity.Categorie;
import freelance.twin.sport.server.product.entity.Genre;

import java.time.LocalDateTime;

public interface ProductProjection {
    Long getId();
    String getName();
    String getRef();
    Genre getGender();
    Categorie getCategorie();
    double getPrice();
    Double getOriginalPrice();
    Double getBuyPrice();
    String getImage();
    LocalDateTime getCreatedAt();
    String getDescription();
    boolean isNewArrival();
    boolean isMarketVisible();
    double getAverageRating();

    BrandProjection getBrand();
    TypeProjection getProductType();

    interface BrandProjection {
        Long getId();
        String getBrand_name();
    }

    interface TypeProjection {
        Long getId();
        String getType_name();
    }
}
