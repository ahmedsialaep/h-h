package freelance.twin.sport.server.stockReservation.service;

import freelance.twin.sport.server.stockReservation.entity.ReservationType;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import freelance.twin.sport.server.stockReservation.repository.StockReservationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class StockReservationService {

    private final StockReservationRepository reservationRepository;
    @Transactional
    public StockReservation addReservation(Long variantId, UUID userId, int quantity, ReservationType type) {
        StockReservation reservation = new StockReservation();
        reservation.setVariantId(variantId);
        reservation.setUserId(userId);
        reservation.setQuantity(quantity);
        reservation.setType(type);
        reservation.setCreatedAt(LocalDateTime.now());


        if (type == ReservationType.CART) {
            reservation.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        } else if (type == ReservationType.ORDER) {
            reservation.setExpiresAt(null);
        }

        return reservationRepository.save(reservation);
    }

    @Transactional
    public void deleteReservation(Long reservationId) {

        StockReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservationRepository.delete(reservation);
    }
    @Transactional
    public void deleteCartReservation(Long variantId, UUID userId) {
        reservationRepository.deleteByVariantIdAndTypeAndUserId(
                variantId, ReservationType.CART, userId
        );
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
    public void confirmOrderReservation(Long variantId, UUID userId, int quantity) {
        Optional<StockReservation> existing = reservationRepository
                .findByUserIdAndVariantIdAndType(userId, variantId, ReservationType.ORDER);

        if (existing.isPresent()) {

            StockReservation res = existing.get();
            res.setExpiresAt(null);
            reservationRepository.save(res);
        } else {

            StockReservation reservation = addReservation(variantId, userId, quantity, ReservationType.ORDER);
            reservation.setExpiresAt(null);
            reservationRepository.save(reservation);
        }
    }

    @Transactional
    public void deleteOrderReservation(Long variantId, UUID userId) {
        reservationRepository.deleteByVariantIdAndTypeAndUserId(
                variantId, ReservationType.ORDER, userId
        );
    }





}
