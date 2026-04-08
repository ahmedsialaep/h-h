package freelance.twin.sport.server.stockReservation.repository;

import freelance.twin.sport.server.stockReservation.entity.ReservationType;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {
    @Query("SELECT COALESCE(SUM(r.quantity), 0) FROM StockReservation r WHERE r.variantId = :variantId AND r.type = :type")
    int sumReservedQuantityByVariant(@Param("variantId") Long variantId, @Param("type") ReservationType type);

    List<StockReservation> findByUserIdAndType(UUID userId, ReservationType type);

    // ← let DB do the filtering, not Java
    @Query("SELECT r FROM StockReservation r WHERE r.type = 'CART' AND r.expiresAt < :now")
    List<StockReservation> findExpiredCartReservations(@Param("now") LocalDateTime now);

    Optional<StockReservation> findByUserIdAndVariantIdAndType(UUID userId, Long variantId, ReservationType type);

    void deleteByVariantIdAndTypeAndUserId(Long variantId, ReservationType type, UUID userId);
    @Query("SELECT r FROM StockReservation r WHERE r.expiresAt < :now AND r.type = 'CART'")
    List<StockReservation> findExpiredCartReservations(LocalDateTime now, Pageable pageable);
}
