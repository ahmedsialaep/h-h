package freelance.twin.sport.server.commande.dto;

import freelance.twin.sport.server.commande.entity.DeliveryMethod;
import freelance.twin.sport.server.commande.entity.Status;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CommandeRequest {

    private String adress;
    private String city;
    private String ref;
    private DeliveryMethod deliveryMethod;
    private String notes;
    private LocalDateTime createdAt;
    private Status status;
    private LocalDateTime updatedAt;
    private String phone;
    private double totalPrice;
    private double deliveryFee;
    // guest only fields

    private String guestFirstName;
    private String guestLastName;
    private String guestEmail;
    private String guestPhone;


    private List<CommandeItemRequest> items;
}
