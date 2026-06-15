package freelance.twin.sport.server.listner;

import freelance.twin.sport.server.config.mail.status_order.OrderStatusMessageService;
import freelance.twin.sport.server.handler.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
@RequiredArgsConstructor
public class OrderStatusEventListener {

    private final OrderStatusMessageService orderStatusMessageService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        orderStatusMessageService.sendOrderStatus(event.userId(), event.commande());
    }
}
