package freelance.twin.sport.server.commande.dto;

import freelance.twin.sport.server.commande.entity.DeliveryMethod;
import freelance.twin.sport.server.commande.entity.Status;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CommandeDto {
    private Long id;
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

    // user
    private UUID userId;
    private String username;
    private String userNom;
    private String userPrenom;

    private String guestFirstName;
    private String guestLastName;
    private String guestEmail;
    private String guestPhone;
    private List<CommandeItemDto> items;
}
