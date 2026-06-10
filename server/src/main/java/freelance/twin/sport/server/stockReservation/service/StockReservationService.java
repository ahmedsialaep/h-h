package freelance.twin.sport.server.stockReservation.service;

import freelance.twin.sport.server.stockReservation.entity.ReservationType;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import freelance.twin.sport.server.stockReservation.repository.StockReservationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class StockReservationService {

    private final StockReservationRepository reservationRepository;
    @Transactional
    public StockReservation addReservation(Long variantId, UUID userId, int quantity, ReservationType type, Long commandeId) {
        StockReservation reservation = new StockReservation();
        reservation.setVariantId(variantId);
        reservation.setUserId(userId);
        reservation.setQuantity(quantity);
        reservation.setType(type);
        reservation.setCreatedAt(LocalDateTime.now());

        reservation.setCommandeId(commandeId);
        if (type == ReservationType.CART) {
            reservation.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        } else if (type == ReservationType.ORDER) {
            reservation.setExpiresAt(null);
        }

        return reservationRepository.save(reservation);
    }

    @Transactional
    public StockReservation buildReservation(Long variantId, UUID userId, int quantity, ReservationType type, Long commandeId) {
        StockReservation reservation = new StockReservation();
        reservation.setVariantId(variantId);
        reservation.setUserId(userId);
        reservation.setQuantity(quantity);
        reservation.setType(type);
        reservation.setCreatedAt(LocalDateTime.now());

        reservation.setCommandeId(commandeId);
        if (type == ReservationType.CART) {
            reservation.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        } else if (type == ReservationType.ORDER) {
            reservation.setExpiresAt(null);
        }

        return reservation;
    }

    public Map<Long, StockReservation> getReservationMapByOrder(Long commandeId, ReservationType type) {
        return reservationRepository.findByCommandeIdAndType(commandeId, type)
                .stream()
                .collect(Collectors.toMap(StockReservation::getVariantId, r -> r));
    }

    public void deleteAllCartReservations(UUID userId) {
        reservationRepository.deleteAllByUserIdAndType(userId, ReservationType.CART);
    }
    @Transactional
    public void deleteReservations(List<StockReservation> reservations) {
        if (!reservations.isEmpty()) {
            reservationRepository.deleteAll(reservations);
        }
    }
    public int sumReservedQuantityPerVariant(Long variantId, ReservationType type){
        return reservationRepository.sumReservedQuantityByVariant(variantId,type);
    }
    public List<StockReservation> getReservationsByUserAndType(UUID userId, ReservationType type) {
        return reservationRepository.findByUserIdAndType(userId, type);
    }
    public Optional<StockReservation> getReservationsByUserAndTypeAndVariant(UUID userId, ReservationType type,Long variantId) {
        return reservationRepository.findByUserIdAndVariantIdAndType(userId, variantId,type);
    }
    @Transactional
    public void confirmOrderReservation(Long variantId, UUID userId, Long commandeId,int quantity) {
        Optional<StockReservation> existing = reservationRepository
                .findByUserIdAndVariantIdAndType(userId, variantId, ReservationType.ORDER);

        if (existing.isPresent()) {

            StockReservation res = existing.get();
            res.setExpiresAt(null);
            reservationRepository.save(res);
        } else {

            StockReservation reservation = buildReservation(variantId, userId, quantity, ReservationType.ORDER, commandeId);
            reservation.setExpiresAt(null);
            reservationRepository.save(reservation);
        }
    }

    @Transactional
    public void deleteOrderReservationByCommandeId(Long commandeId) {
        reservationRepository.deleteAllByCommandeId(commandeId, ReservationType.ORDER);
    }

    public void saveAll(List<StockReservation> reservations) {
        reservationRepository.saveAll(reservations);
    }





}
