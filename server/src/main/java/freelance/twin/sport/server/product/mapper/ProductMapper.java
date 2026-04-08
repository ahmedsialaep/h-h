package freelance.twin.sport.server.product.mapper;


import freelance.twin.sport.server.product.dto.ProductDto;
import freelance.twin.sport.server.product.dto.ProductVariantDTO;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;

import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductDto toDTO(Product product) {

        ProductDto dto = new ProductDto();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setRef(product.getRef());
        dto.setGender(product.getGender());
        dto.setCategorie(product.getCategorie());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
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

        dto.setVariants(variants);

        return dto;
    }


}
