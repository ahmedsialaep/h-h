package freelance.twin.sport.server.cart.service;

import freelance.twin.sport.server.cart.dto.CartItemDto;
import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.cart.entity.CartItem;
import freelance.twin.sport.server.cart.mapper.CartMapper;
import freelance.twin.sport.server.cart.repository.CartRepository;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.repository.ProductRepository;
import freelance.twin.sport.server.product.repository.ProductVarsRepository;
import freelance.twin.sport.server.stockReservation.entity.ReservationType;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import freelance.twin.sport.server.stockReservation.service.StockReservationService;
import freelance.twin.sport.server.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductVarsRepository productVarsRepository;
    private final StockReservationService reservationService;

    public Cart getOrCreateCart(User user) {
        Optional<Cart> existingCart = cartRepository.findCartByUser_Id(user.getId());

        if (existingCart.isPresent()) {
            return existingCart.get();
        } else {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setCreatedAt(LocalDateTime.now());
            newCart.setUpdatedAt(LocalDateTime.now());
            return cartRepository.save(newCart);
        }
    }

    @Transactional
    public List<CartItemDto> updateCartItems(Cart cart, List<CartItemDto> items, UUID userId) {


        List<StockReservation> oldReservations = reservationService
                .getReservationsByUserAndType(userId, ReservationType.CART);
        reservationService.deleteReservations(oldReservations);


        oldReservations.forEach(res -> {
            productVarsRepository.findById(res.getVariantId()).ifPresent(variant -> {
                variant.setAvailableQuantity(variant.getAvailableQuantity() + res.getQuantity());
                productVarsRepository.save(variant);
            });
        });

        cart.getItems().clear();

        List<CartItem> cartItems = items.stream().map(dto -> {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            ProductVars variant = productVarsRepository.findById(dto.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));


            int available = variant.getAvailableQuantity();

            if (dto.getQuantity() > available) {
                throw new RuntimeException("Stock insuffisant pour: " + variant.getSize()
                        + " (disponible: " + available + ", demandé: " + dto.getQuantity() + ")");
            }

            // ← create new reservation
            reservationService.addReservation(
                    variant.getId(), userId, dto.getQuantity(), ReservationType.CART
            );

            // ← decrement availableQuantity
            variant.setAvailableQuantity(available - dto.getQuantity());
            productVarsRepository.save(variant);

            return CartMapper.toEntity(dto, cart, product, variant);
        }).toList();

        cart.getItems().addAll(cartItems);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cart.getItems().stream()
                .map(CartMapper::toItemDTO)
                .toList();
    }
}
