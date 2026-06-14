package freelance.twin.sport.server.stockReservation.service;

import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.cart.repository.CartItemRepository;
import freelance.twin.sport.server.cart.repository.CartRepository;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.repository.ProductVarsRepository;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import freelance.twin.sport.server.stockReservation.repository.StockReservationRepository;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.utils.JwtUtils;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockCleanupService {

    private final StockReservationRepository reservationRepository;
    private final ProductVarsRepository productVarsRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;


    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void cleanupExpiredReservations() {
        int batchSize = 500;
        int processed;

        do {
            List<StockReservation> batch = reservationRepository
                    .findExpiredCartReservations(LocalDateTime.now(), PageRequest.of(0, batchSize));

            if (batch.isEmpty()) break;

            restoreStock(batch);
            restoreUserCart(batch);
            reservationRepository.deleteAll(batch);

            processed = batch.size();
        } while (processed == batchSize); // keep going until no full batch
    }
    private void restoreStock(List<StockReservation> expiredReservations) {

        Map<Long, Integer> totalsByVariant = expiredReservations.stream()
                .collect(Collectors.groupingBy(
                        StockReservation::getVariantId,
                        Collectors.summingInt(StockReservation::getQuantity)
                ));

        totalsByVariant.forEach(productVarsRepository::incrementStock
        );
    }
    private void restoreUserCart(List<StockReservation> expiredReservations) {

        Map<UUID, List<StockReservation>> byUser = expiredReservations.stream()
                .filter(r -> r.getUserId() != null)
                .collect(Collectors.groupingBy(StockReservation::getUserId));

        Map<UUID, Cart> cartByUserId = cartRepository.findCartsByUser_IdIn(byUser.keySet())
                .stream()
                .collect(Collectors.toMap(cart -> cart.getUser().getId(), c -> c));

        List<Cart> updatedCarts = new ArrayList<>();

        byUser.forEach((userId, reservations) -> {
            Cart cart = cartByUserId.get(userId);
            if (cart == null) return;

            List<Long> expiredVariantIds = reservations.stream()
                    .map(StockReservation::getVariantId)
                    .toList();

            cartItemRepository.deleteByCartIdAndVariantIds(cart.getId(), expiredVariantIds);

            cart.setUpdatedAt(LocalDateTime.now());
            updatedCarts.add(cart);
        });

        if (!updatedCarts.isEmpty()) {
            cartRepository.saveAll(updatedCarts);
        }
    }
}
