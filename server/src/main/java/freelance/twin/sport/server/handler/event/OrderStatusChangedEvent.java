package freelance.twin.sport.server.handler.event;

import freelance.twin.sport.server.commande.entity.Commande;
import java.util.UUID;

public record OrderStatusChangedEvent(UUID userId, Commande commande) {}
