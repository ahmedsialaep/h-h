package freelance.twin.sport.server.cart.controller;

import freelance.twin.sport.server.cart.dto.CartDto;
import freelance.twin.sport.server.cart.dto.CartItemDto;
import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.cart.entity.CartItem;
import freelance.twin.sport.server.cart.mapper.CartMapper;
import freelance.twin.sport.server.cart.service.CartService;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.repository.UserRepository;
import freelance.twin.sport.server.user.service.UserService;
import freelance.twin.sport.server.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getCart() {
        try {

            User user = userService.getCurrentUser();
            CartDto cart = cartService.getOrCreateCart(user);

            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> updateCartItems(
            @RequestBody List<CartItemDto> items
            ) {


            User user = userService.getCurrentUser();
            CartDto cart = cartService.getOrCreateCart(user);

            List<CartItemDto> updated = cartService.updateCartItems(cart, items, user.getId());
            return ResponseEntity.ok(updated);

    }
}
