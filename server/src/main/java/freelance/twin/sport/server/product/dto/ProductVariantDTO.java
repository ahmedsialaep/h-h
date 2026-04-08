package freelance.twin.sport.server.product.dto;

public record ProductVariantDTO(
        Long id,
        String size,
        String color,
        int stock,
        int soldQuantity,
        int availableQuantity,
        Long productId
) {}
