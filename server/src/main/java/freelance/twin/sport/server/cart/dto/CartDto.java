package freelance.twin.sport.server.cart.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CartDto {
    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID userId;
    private String userNom;
    private String userPrenom;
    private String username;
    private List<CartItemDto> cartItemDtos;
}
