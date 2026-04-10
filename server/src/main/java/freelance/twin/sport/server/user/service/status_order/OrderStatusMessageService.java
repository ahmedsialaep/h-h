package freelance.twin.sport.server.user.service.status_order;

import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.user.entity.User;

public interface OrderStatusMessageService {
    boolean sendOrderStatus(User to, Commande commande);
}
