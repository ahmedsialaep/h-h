package freelance.twin.sport.server.commande.service;

import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.cart.exception.EmptyCartException;
import freelance.twin.sport.server.cart.repository.CartRepository;
import freelance.twin.sport.server.commande.dto.*;
import freelance.twin.sport.server.commande.entity.CommandItem;
import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.DeliveryMethod;
import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.commande.exception.EmptyRequestException;
import freelance.twin.sport.server.commande.exception.QteInsuffisantException;
import freelance.twin.sport.server.commande.mapper.CommandeMapper;
import freelance.twin.sport.server.commande.repository.CommandeItemRepository;
import freelance.twin.sport.server.commande.repository.CommandeRepository;
import freelance.twin.sport.server.handler.event.OrderStatusChangedEvent;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.exception.ProductNotFoundException;
import freelance.twin.sport.server.product.exception.VariantNotFoundException;
import freelance.twin.sport.server.product.repository.ProductRepository;
import freelance.twin.sport.server.product.repository.ProductVarsRepository;
import freelance.twin.sport.server.stockReservation.entity.ReservationType;
import freelance.twin.sport.server.stockReservation.entity.StockReservation;
import freelance.twin.sport.server.stockReservation.service.StockReservationService;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.repository.UserRepository;
import freelance.twin.sport.server.config.mail.status_order.OrderStatusMessageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    private final CommandeItemRepository commandeItemRepository;
    private final ApplicationEventPublisher eventPublisher;


    public Page<CommandeDto> retrieveAllCommandes(CommandeFilterRequest filter) {
        Sort sort = filter.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(filter.getSortBy()).ascending()
                : Sort.by(filter.getSortBy()).descending();

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getPageSize(), sort);

        String search = filter.getSearch() != null
                ? "%" + filter.getSearch().toLowerCase().trim() + "%"
                : null;

        List<Status> statuses = (filter.getStatus() != null && !filter.getStatus().isEmpty())
                ? filter.getStatus()
                : null;

        return commandeRepository.findAllWithFilters(filter.getUserId(), search, statuses, pageable)
                .map(CommandeMapper::toDTO);
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
    public List<CommandeDto> retrieveAllCommandesByUser(UUID userId) {
        return commandeRepository.findCommandesByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(CommandeMapper::toDTO)
                .toList();
    }

    @Transactional
    public Commande updateStatus(Long commandeId, Status status, String commentaire) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new EntityNotFoundException("Commande not found"));

        Status currentStatus = commande.getStatus();
        UUID userId = commande.getUser() != null ? commande.getUser().getId() : null;

        Map<Long, StockReservation> reservationMap = reservationService.
                getReservationMapByOrder(commandeId,ReservationType.ORDER);

        switch (status) {

            case CONFIRMEE -> {
                commande.getItems().forEach(item -> {
                    ProductVars variant = item.getVariant();


                    StockReservation orderReservation = reservationMap.get(variant.getId());

                    if (orderReservation != null) {
                        // ✅ reservation exists → stock was already handled at checkout, skip everything
                        return;
                    }

                    // no reservation → guest order or missing reservation → check available stock
                    int available = variant.getAvailableQuantity();
                    if (available < item.getQuantity()) {
                        throw new QteInsuffisantException(
                                "Stock insuffisant pour: " + item.getProduct().getName() +
                                        " (disponible: " + available + ", demandé: " + item.getQuantity() + ")"
                        );
                    }
                    variant.setAvailableQuantity(variant.getAvailableQuantity() - item.getQuantity());
                    varsRepository.save(variant);
                    reservationService.confirmOrderReservation(variant.getId(), userId, commandeId,item.getQuantity());
                });
            }

            case LIVREE, RECUPEREE -> {
                List<ProductVars> variants = commande.getItems().stream()
                        .map(item -> {
                            ProductVars variant = item.getVariant();
                            variant.setStock(variant.getStock() - item.getQuantity());
                            variant.setSoldQuantity(variant.getSoldQuantity() + item.getQuantity());
                            return variant;
                        })
                        .toList();

                varsRepository.saveAll(variants);
                reservationService.deleteOrderReservationByCommandeId(commandeId);
            }

            case ANNULEE -> {
                if (currentStatus == Status.EN_ATTENTE
                        || currentStatus == Status.CONFIRMEE
                        || currentStatus == Status.EXPEDIEE) {

                    List<ProductVars> variants = commande.getItems().stream()
                            .map(item -> {
                                ProductVars variant = item.getVariant();
                                variant.setAvailableQuantity(variant.getAvailableQuantity() + item.getQuantity());
                                return variant;
                            })
                            .toList();

                    varsRepository.saveAll(variants);
                    reservationService.deleteOrderReservationByCommandeId(commandeId);

                } else if (currentStatus == Status.LIVREE || currentStatus == Status.RECUPEREE) {

                    List<ProductVars> variants = commande.getItems().stream()
                            .map(item -> {
                                ProductVars variant = item.getVariant();
                                variant.setAvailableQuantity(variant.getAvailableQuantity() + item.getQuantity());
                                variant.setStock(variant.getStock() + item.getQuantity());
                                variant.setSoldQuantity(variant.getSoldQuantity() - item.getQuantity());
                                return variant;
                            })
                            .toList();

                    varsRepository.saveAll(variants);
                }
            }

            default -> {}
        }
        if (commentaire != null && !commentaire.isEmpty()) {
            commande.setCommentaire(commentaire);
        }
        commande.setStatus(status);
        commande.setUpdatedAt(LocalDateTime.now());
        if (status != null) {
            eventPublisher.publishEvent(new OrderStatusChangedEvent(userId, commande));
        }
        return commandeRepository.save(commande);
    }

    @Transactional
    public CommandeDto createCommande(CommandeRequest request, UUID userId) {
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

        Commande saved = commandeRepository.save(commande);

        if (userId != null) {
            reservationService.deleteAllCartReservations(userId);

            List<StockReservation> orderReservations = saved.getItems().stream()
                    .map(item -> reservationService.buildReservation(
                            item.getVariant().getId(),
                            userId,
                            item.getQuantity(),
                            ReservationType.ORDER,
                            saved.getId()
                    ))
                    .toList();

            reservationService.saveAll(orderReservations);
        }
        else {
            List<StockReservation> guestReservations = saved.getItems().stream()
                    .map(item -> reservationService.buildReservation(
                            item.getVariant().getId(),
                            null,
                            item.getQuantity(),
                            ReservationType.ORDER,
                            saved.getId()
                    ))
                    .toList();

            reservationService.saveAll(guestReservations);
        }

        // ✅ session still open here — Brand, Variant, Product all accessible
        return CommandeMapper.toDTOwithItems(saved);
    }
    private void buildItemsFromCart(Commande commande, Cart cart) {
        if (cart.getItems().isEmpty())
            throw new EmptyCartException("Panier vide");

        UUID userId = commande.getUser().getId();
        List<ProductVars> modifiedVariants = new ArrayList<>();
        Map<Long, StockReservation> reservationMap = reservationService
                .getReservationsByUserAndType(userId, ReservationType.CART)
                .stream()
                .collect(Collectors.toMap(StockReservation::getVariantId, r -> r));

        List<CommandItem> items = cart.getItems().stream().map(cartItem -> {
            Long variantId = cartItem.getVariant().getId();
            int requested = cartItem.getQuantity();

            StockReservation reservation = reservationMap.get(variantId);
            if (reservation == null || reservation.getQuantity() < requested) {

                int available = cartItem.getVariant().getAvailableQuantity();
                if (available < requested) {
                    throw new QteInsuffisantException(
                            "Stock insuffisant pour: " + cartItem.getProduct().getName() +
                                    " (disponible: " + available + ", demandé: " + requested + ")"
                    );
                }
                cartItem.getVariant().setAvailableQuantity(available - requested);
                modifiedVariants.add(cartItem.getVariant());
            }
            CommandItem item = new CommandItem();
            item.setCommande(commande);
            item.setProduct(cartItem.getProduct());
            item.setVariant(cartItem.getVariant());
            item.setQuantity(cartItem.getQuantity());
            item.setUnitPrice(cartItem.getProduct().getPrice());
            item.setCommandeRef(commande.getRef());
            return item;
        }).toList();

        if (!modifiedVariants.isEmpty()) {
            varsRepository.saveAll(modifiedVariants);
        }

        finalizeCommande(commande, items);

        cart.getItems().clear();
        cartRepository.save(cart);
    }
    private void buildItemsFromRequest(Commande commande, List<CommandeItemRequest> requestItems) {
        if (requestItems == null || requestItems.isEmpty())
            throw new EmptyRequestException("Aucun article dans la commande");

        List<CommandItem> items = requestItems.stream().map(req -> {
            Product product = productRepository.findById(req.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException("Produit introuvable: " + req.getProductId()));
            ProductVars variant = varsRepository.findById(req.getVariantId())
                    .orElseThrow(() -> new VariantNotFoundException("Variante introuvable: " + req.getVariantId()));

            int updated = varsRepository.decrementStock(variant.getId(), req.getQuantity());
            if (updated == 0) {
                throw new QteInsuffisantException(
                        "Stock insuffisant pour: " + product.getName()
                );
            }
            CommandItem item = new CommandItem();
            item.setCommande(commande);
            item.setProduct(product);
            item.setVariant(variant);
            item.setQuantity(req.getQuantity());
            item.setCommandeRef(commande.getRef());
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
    @Transactional(readOnly = true)
    public CommandeDto findByRef(String ref) {
        Commande commande = commandeRepository.findCommandeByRef(ref);
        return CommandeMapper.toDTOwithItems(commande);
    }
    @Transactional(readOnly = true)
    public List<CommandeItemDto> findCommandeItemsByRef(String ref) {
        return commandeItemRepository.findAllByCommande_Ref(ref)
                .stream()
                .map(CommandeMapper::toItemDTO)
                .toList();
    }
}
