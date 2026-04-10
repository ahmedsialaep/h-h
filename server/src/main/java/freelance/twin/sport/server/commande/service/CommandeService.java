package freelance.twin.sport.server.commande.service;

import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.cart.repository.CartRepository;
import freelance.twin.sport.server.commande.dto.CommandeFilterRequest;
import freelance.twin.sport.server.commande.dto.CommandeItemRequest;
import freelance.twin.sport.server.commande.dto.CommandeRequest;
import freelance.twin.sport.server.commande.entity.CommandItem;
import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.DeliveryMethod;
import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.commande.repository.CommandeRepository;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.repository.ProductRepository;
import freelance.twin.sport.server.product.repository.ProductVarsRepository;
import freelance.twin.sport.server.stockReservation.entity.ReservationType;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import freelance.twin.sport.server.stockReservation.service.StockReservationService;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.repository.UserRepository;
import freelance.twin.sport.server.config.mail.status_order.OrderStatusMessageService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVarsRepository varsRepository;
    private final StockReservationService reservationService;
    private final OrderStatusMessageService orderStatusMessageService;
    // Retrieve all commandes
    public List<Commande> retrieveAllCommandes() {
        return commandeRepository.findAll();
    }
    public Page<Commande> retrieveAllCommandes(CommandeFilterRequest filter) {
        Pageable pageable = PageRequest.of(
                filter.getPage(),
                filter.getPageSize(),
                Sort.by("createdAt").descending()
        );

        String search = filter.getSearch() != null
                ? "%" + filter.getSearch().toLowerCase().trim() + "%"
                : null;

        List<Status> statuses = (filter.getStatus() != null && !filter.getStatus().isEmpty())
                ? filter.getStatus()
                : null;

        return commandeRepository.findAllWithFilters(
                filter.getUserId(),
                search,
                statuses,
                pageable
        );
    }

    public Commande retrieveCommande(Long id) {
        return commandeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Commande not found with id: " + id));
    }

    // Add or update a commande
    public Commande addOrUpdateCommande(Commande commande) {
        return commandeRepository.save(commande);
    }

    // Remove a commande by ID
    public void removeCommande(Long id) {
        if (!commandeRepository.existsById(id)) {
            throw new EntityNotFoundException("Commande not found with id: " + id);
        }
        commandeRepository.deleteById(id);
    }

    // Retrieve all commandes By user
    public List<Commande> retrieveAllCommandesByUser(UUID userId) {
        return commandeRepository.findCommandesByUser_Id(userId);
    }

    @Transactional
    public Commande updateStatus(Long commandeId, Status status) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new EntityNotFoundException("Commande not found"));

        Status currentStatus = commande.getStatus();
        UUID userId = commande.getUser() != null ? commande.getUser().getId() : null;

        switch (status) {

            case CONFIRMEE -> {
                commande.getItems().forEach(item -> {
                    ProductVars variant = item.getVariant();

                    Optional<StockReservation> orderReservation = reservationService
                            .getReservationsByUserAndTypeAndVariant(userId, ReservationType.ORDER, variant.getId());

                    if (orderReservation.isPresent()) {
                        // ✅ reservation exists → stock was already handled at checkout, skip everything
                        return;
                    }

                    // no reservation → guest order or missing reservation → check available stock
                    int available = variant.getAvailableQuantity();
                    if (available < item.getQuantity()) {
                        throw new RuntimeException(
                                "Stock insuffisant pour: " + item.getProduct().getName() +
                                        " (disponible: " + available + ", demandé: " + item.getQuantity() + ")"
                        );
                    }
                    variant.setAvailableQuantity(variant.getAvailableQuantity() - item.getQuantity());
                    varsRepository.save(variant);
                    reservationService.confirmOrderReservation(variant.getId(), userId, item.getQuantity());
                });
            }

            case LIVREE, PRETE_RETRAIT -> {
                commande.getItems().forEach(item -> {
                    ProductVars variant = item.getVariant();

                    variant.setStock(variant.getStock() - item.getQuantity());
                    variant.setSoldQuantity(variant.getSoldQuantity() + item.getQuantity());
                    varsRepository.save(variant);

                    // ← delete ORDER reservation
                    reservationService.deleteOrderReservation(variant.getId(), userId);
                });
            }

            case ANNULEE -> {
                if ( currentStatus == Status.EN_ATTENTE ||currentStatus == Status.CONFIRMEE || currentStatus == Status.EXPEDIEE) {
                    commande.getItems().forEach(item -> {
                        ProductVars variant = item.getVariant();

                        variant.setAvailableQuantity(variant.getAvailableQuantity() + item.getQuantity());
                        varsRepository.save(variant);
                        reservationService.deleteOrderReservation(variant.getId(), userId);
                    });
                } else if (currentStatus == Status.LIVREE || currentStatus == Status.PRETE_RETRAIT) {
                    // stock was already decremented → restore both
                    commande.getItems().forEach(item -> {
                        ProductVars variant = item.getVariant();
                        variant.setAvailableQuantity(variant.getAvailableQuantity() + item.getQuantity());
                        variant.setStock(variant.getStock() + item.getQuantity());
                        variant.setSoldQuantity(variant.getSoldQuantity() - item.getQuantity());
                        varsRepository.save(variant);
                    });
                }

            }

            default -> {}
        }

        commande.setStatus(status);
        commande.setUpdatedAt(LocalDateTime.now());
        if(status != null) {
            orderStatusMessageService.sendOrderStatus(userId,commande);
        }
        return commandeRepository.save(commande);
    }

    public Commande createCommande(CommandeRequest request, UUID userId) {
        Commande commande = new Commande();
        commande.setRef("CMD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        commande.setCreatedAt(LocalDateTime.now());
        commande.setStatus(Status.EN_ATTENTE);
        commande.setAdress(request.getAdress());
        commande.setCity(request.getCity());
        commande.setDeliveryMethod(request.getDeliveryMethod());
        commande.setNotes(request.getNotes());
        commande.setPhone(request.getPhone());

        if (userId != null) {
            User user = userRepository.findUserById(userId);
            commande.setUser(user);
            Cart cart = cartRepository.findLatestCartByUserId(userId).get();
            buildItemsFromCart(commande, cart);
        } else {
            commande.setGuestFirstName(request.getGuestFirstName());
            commande.setGuestLastName(request.getGuestLastName());
            commande.setGuestEmail(request.getGuestEmail());
            commande.setGuestPhone(request.getPhone());
            buildItemsFromRequest(commande, request.getItems());
        }

        // save first so items are persisted
        Commande saved = commandeRepository.save(commande);

        // now handle reservations — items are loaded
        if (userId != null) {
            saved.getItems().forEach(item -> {
                Long variantId = item.getVariant().getId();
                reservationService.deleteCartReservation(variantId, userId);
                StockReservation res = reservationService.addReservation(
                        variantId, userId, item.getQuantity(), ReservationType.ORDER
                );
                System.out.println("ORDER reservation created: variantId=" + variantId
                        + " userId=" + userId + " reservationId=" + res.getId());
            });
        }

        return saved;
    }
    private void buildItemsFromCart(Commande commande, Cart cart) {
        if (cart.getItems().isEmpty())
            throw new RuntimeException("Panier vide");

        List<CommandItem> items = cart.getItems().stream().map(cartItem -> {
            CommandItem item = new CommandItem();
            item.setCommande(commande);
            item.setProduct(cartItem.getProduct());
            item.setVariant(cartItem.getVariant());
            item.setQuantity(cartItem.getQuantity());
            item.setUnitPrice(cartItem.getProduct().getPrice());
            return item;
        }).toList();

        finalizeCommande(commande, items);

        cart.getItems().clear();
        cartRepository.save(cart);
    }
    private void buildItemsFromRequest(Commande commande, List<CommandeItemRequest> requestItems) {
        if (requestItems == null || requestItems.isEmpty())
            throw new RuntimeException("Aucun article dans la commande");

        List<CommandItem> items = requestItems.stream().map(req -> {
            Product product = productRepository.findById(req.getProductId())
                    .orElseThrow(() -> new RuntimeException("Produit introuvable: " + req.getProductId()));
            ProductVars variant = varsRepository.findById(req.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variante introuvable: " + req.getVariantId()));

            CommandItem item = new CommandItem();
            item.setCommande(commande);
            item.setProduct(product);
            item.setVariant(variant);
            item.setQuantity(req.getQuantity());
            item.setUnitPrice(product.getPrice());
            return item;
        }).toList();

        finalizeCommande(commande, items);
    }
    private void finalizeCommande(Commande commande, List<CommandItem> items) {

        double deliveryFee = commande.getDeliveryMethod() == DeliveryMethod.PICKUP ? 0 : 7.0;
        double totalPrice = items.stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum() + deliveryFee;

        commande.setItems(items);
        commande.setDeliveryFee(deliveryFee);
        commande.setTotalPrice(totalPrice);
    }
    public Commande findByRef(String ref){
        return commandeRepository.findCommandeByRef(ref);
    }
}
