package freelance.twin.sport.server.product.mapper;


import freelance.twin.sport.server.product.dto.ProductDto;
import freelance.twin.sport.server.product.dto.ProductVariantDTO;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.projection.ProductProjection;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {


    public static ProductDto fromProjection(ProductProjection p, int totalStock, int totalAvailableQte) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setRef(p.getRef());
        dto.setGender(p.getGender());
        dto.setCategorie(p.getCategorie());
        dto.setPrice(p.getPrice());
        dto.setOriginalPrice(p.getOriginalPrice());
        dto.setBuyPrice(p.getBuyPrice());
        dto.setImage(p.getImage());
        dto.setCreatedAt(p.getCreatedAt());

        dto.setDescription(p.getDescription());
        dto.setNewArrival(p.isNewArrival());
        dto.setMarketVisible(p.isMarketVisible());
        dto.setAverageRating(p.getAverageRating());
        if (p.getBrand() != null) {
            dto.setBrandId(p.getBrand().getId());
            dto.setBrandName(p.getBrand().getBrand_name());
        }

        if (p.getProductType() != null) {
            dto.setTypeId(p.getProductType().getId());
            dto.setTypeName(p.getProductType().getType_name());
        }
        dto.setTotalStock(totalStock);
        dto.setTotalAvailableQte(totalAvailableQte);
        return dto;
    }
    public static ProductDto toDTO(Product product, int totalStock, int totalAvailableQte) {

        ProductDto dto = new ProductDto();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setRef(product.getRef());
        dto.setGender(product.getGender());
        dto.setCategorie(product.getCategorie());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setBuyPrice(product.getBuyPrice());
        dto.setImage(product.getImage());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setBrandId(product.getBrand().getId());
        dto.setBrandName(product.getBrand().getBrand_name());

        dto.setTypeId(product.getProductType().getId());
        dto.setTypeName(product.getProductType().getType_name());

        dto.setDescription(product.getDescription());
        dto.setNewArrival(product.isNewArrival());
        dto.setMarketVisible(product.isMarketVisible());
        dto.setAverageRating(product.getAverageRating());

        dto.setTotalStock(totalStock);
        dto.setTotalAvailableQte(totalAvailableQte);

        return dto;
    }
    public static ProductDto toDetailDTO(Product product) {

        ProductDto dto = new ProductDto();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setRef(product.getRef());
        dto.setGender(product.getGender());
        dto.setCategorie(product.getCategorie());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setBuyPrice(product.getBuyPrice());
        dto.setImage(product.getImage());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setBrandId(product.getBrand().getId());
        dto.setBrandName(product.getBrand().getBrand_name());

        dto.setTypeId(product.getProductType().getId());
        dto.setTypeName(product.getProductType().getType_name());

        dto.setDescription(product.getDescription());
        dto.setNewArrival(product.isNewArrival());
        dto.setMarketVisible(product.isMarketVisible());
        dto.setAverageRating(product.getAverageRating());
        List<ProductVariantDTO> variants = product.getVariants()
                .stream()
                .sorted(Comparator.comparingDouble(v -> {
                    try { return Double.parseDouble(v.getSize()); }
                    catch (NumberFormatException e) { return 0.0; }
                }))
                .map(v -> new ProductVariantDTO(
                        v.getId(),
                        v.getSize(),
                        v.getColor(),
                        v.getStock(),
                        v.getSoldQuantity(),
                        v.getAvailableQuantity(),
                        v.getProduct().getId()
                ))
                .toList();

        dto.setVariantDTOS(variants);

        return dto;
    }

    public static ProductVariantDTO toVarsDTO(ProductVars v) {
        return new ProductVariantDTO(
                v.getId(),
                v.getSize(),
                v.getColor(),
                v.getStock(),
                v.getSoldQuantity(),
                v.getAvailableQuantity(),
                v.getProduct() != null ? v.getProduct().getId() : null
        );
    }

}
