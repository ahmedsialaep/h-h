package freelance.twin.sport.server.commande.projection;

import freelance.twin.sport.server.commande.entity.DeliveryMethod;
import freelance.twin.sport.server.commande.entity.Status;

import java.time.LocalDateTime;
import java.util.UUID;

public interface CommandeProjection {
    Long getId();
    String getAdress();
    String getCity();
    String getRef();
    DeliveryMethod getDeliveryMethod();
    String getNotes();
    String getCommentaire();
    LocalDateTime getCreatedAt();
    Status getStatus();
    LocalDateTime getUpdatedAt();
    String getPhone();
    double getTotalPrice();
    double getDeliveryFee();

    // user
    UUID getUserId();
    String getUsername();
    String getUserNom();
    String getUserPrenom();

    // guest
    String getGuestFirstName();
    String getGuestLastName();
    String getGuestEmail();
    String getGuestPhone();
}
