package freelance.twin.sport.server.stockReservation.entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(
        name = "stock_reservation",
        indexes = {
                @Index(name = "idx_user_id", columnList = "userId"),
                @Index(name = "idx_variant_id", columnList = "variantId"),

                @Index(name = "idx_variant_type", columnList = "variantId,type"),
                @Index(name = "idx_user_type", columnList = "userId,type"),
                @Index(name = "idx_reservation_expires_at", columnList = "expires_at")
        }
)
public class StockReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long variantId;

    private UUID userId;

    private int quantity;

    @Enumerated(EnumType.STRING)
    private ReservationType type;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}