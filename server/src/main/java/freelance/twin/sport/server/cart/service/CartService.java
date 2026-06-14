package freelance.twin.sport.server.cart.service;

import freelance.twin.sport.server.cart.dto.CartDto;
import freelance.twin.sport.server.cart.dto.CartItemDto;
import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.cart.entity.CartItem;
import freelance.twin.sport.server.cart.mapper.CartMapper;
import freelance.twin.sport.server.cart.repository.CartRepository;
import freelance.twin.sport.server.commande.exception.QteInsuffisantException;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.exception.ProductException;
import freelance.twin.sport.server.product.exception.ProductNotFoundException;
import freelance.twin.sport.server.product.repository.ProductRepository;
import freelance.twin.sport.server.product.repository.ProductVarsRepository;
import freelance.twin.sport.server.stockReservation.entity.ReservationType;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import freelance.twin.sport.server.stockReservation.service.StockReservationService;
import freelance.twin.sport.server.user.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductVarsRepository productVarsRepository;
    private final StockReservationService reservationService;
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public CartDto getOrCreateCart(User user) {
        Optional<Cart> existingCart = cartRepository.findCartWithItemsByUserId(user.getId());

        Cart cart;
        if (existingCart.isPresent()) {
            cart = existingCart.get();
        } else {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setItems(new ArrayList<>());
            newCart.setCreatedAt(LocalDateTime.now());
            newCart.setUpdatedAt(LocalDateTime.now());
            cart = cartRepository.save(newCart);
        }

        return CartMapper.toDTO(cart);
    }

    @Transactional
    public List<CartItemDto> updateCartItems(CartDto cartDto, List<CartItemDto> items, UUID userId) {

        Cart cart = cartRepository.findCartWithItemsByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<StockReservation> oldReservations = reservationService
                .getReservationsByUserAndType(userId, ReservationType.CART);
        reservationService.deleteReservations(oldReservations);

        if (!oldReservations.isEmpty()) {
            Map<Long, Integer> totalsByVariant = oldReservations.stream()
                    .collect(Collectors.groupingBy(
                            StockReservation::getVariantId,
                            Collectors.summingInt(StockReservation::getQuantity)
                    ));

            totalsByVariant.forEach(productVarsRepository::incrementStock);
        }

        cart.getItems().clear();

        List<Long> productIds = items.stream().map(CartItemDto::getProductId).toList();
        List<Long> variantIds = items.stream().map(CartItemDto::getVariantId).toList();

        Map<Long, Product> productMap = productRepository.findAllById(productIds)
                .stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        Map<Long, ProductVars> variantMap = productVarsRepository.findAllById(variantIds)
                .stream()
                .collect(Collectors.toMap(ProductVars::getId, v -> v));

        List<StockReservation> newReservations = new ArrayList<>();

        List<CartItem> cartItems = items.stream().map(dto -> {
            Product product = Optional.ofNullable(productMap.get(dto.getProductId()))
                    .orElseThrow(() -> new ProductNotFoundException("Produit inconnu"));

            ProductVars variant = Optional.ofNullable(variantMap.get(dto.getVariantId()))
                    .orElseThrow(() -> new RuntimeException("Variant du Produit inconnu"));

            int updatedRows = productVarsRepository.decrementStock(variant.getId(), dto.getQuantity());
            if (updatedRows == 0) {
                throw new QteInsuffisantException("Stock insuffisant pour: " + variant.getSize());
            }

            variant.setAvailableQuantity(variant.getAvailableQuantity() - dto.getQuantity());

            entityManager.detach(variant);

            newReservations.add(reservationService.buildReservation(
                    variant.getId(), userId, dto.getQuantity(), ReservationType.CART, null
            ));

            return CartMapper.toEntity(dto, cart, product, variant);
        }).toList();

        reservationService.saveAll(newReservations);

        cart.getItems().addAll(cartItems);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cart.getItems().stream()
                .map(CartMapper::toItemDTO)
                .toList();
    }
}
