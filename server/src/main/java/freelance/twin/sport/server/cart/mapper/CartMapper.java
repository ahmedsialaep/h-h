package freelance.twin.sport.server.cart.mapper;

import freelance.twin.sport.server.cart.dto.CartDto;
import freelance.twin.sport.server.cart.dto.CartItemDto;
import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.cart.entity.CartItem;
import freelance.twin.sport.server.commande.entity.CommandItem;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;

import java.util.ArrayList;


public class CartMapper {
    public static CartDto toDTO(Cart c) {
        CartDto dto = new CartDto();
        dto.setId(c.getId());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());

        if (c.getUser() != null) {
            dto.setUserId(c.getUser().getId());
            dto.setUserNom(c.getUser().getNom());
            dto.setUserPrenom(c.getUser().getPrenom());
            dto.setUsername(c.getUser().getUsername());
        }

        dto.setCartItemDtos(
                c.getItems() != null
                        ? c.getItems().stream()
                        .map(CartMapper::toItemDTO)
                        .toList()
                        : new ArrayList<>()
        );

        return dto;
    }
    public static CartItem toEntity(CartItemDto dto, Cart cart, Product product, ProductVars variant) {
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setVariant(variant);
        item.setQuantity(dto.getQuantity());
        return item;
    }

    public static CartItemDto toItemDTO(CartItem item) {
        CartItemDto dto = new CartItemDto();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());

        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            dto.setProductRef(item.getProduct().getRef());
            dto.setProductPrice(item.getProduct().getPrice());
            dto.setProductImage(item.getProduct().getImage());
            dto.setBrandName(item.getProduct().getBrand() != null
                    ? item.getProduct().getBrand().getBrand_name() : null);
        }

        if (item.getVariant() != null) {
            dto.setVariantId(item.getVariant().getId());
            dto.setVariantSize(item.getVariant().getSize());
            dto.setVariantColor(item.getVariant().getColor());
        }

        return dto;
    }
}
