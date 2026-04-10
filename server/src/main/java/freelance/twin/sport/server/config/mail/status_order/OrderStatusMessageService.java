package freelance.twin.sport.server.config.mail.status_order;

import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.user.entity.User;

import java.util.UUID;

public interface OrderStatusMessageService {
    boolean sendOrderStatus(UUID toID, Commande commande);
}
