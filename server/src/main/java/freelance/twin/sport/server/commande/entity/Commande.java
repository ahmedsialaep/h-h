package freelance.twin.sport.server.commande.entity;

import freelance.twin.sport.server.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "commandes", indexes = {
        @Index(name = "idx_commande_user_id", columnList = "user_id"),
        @Index(name = "idx_commande_status", columnList = "status"),
        @Index(name = "idx_commande_created_at", columnList = "created_at"),
        @Index(name = "idx_commande_ref", columnList = "ref")
})
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ref;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    // ── Delivery ─────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    private DeliveryMethod deliveryMethod;

    private String adress;
    private String city;
    private String phone;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // ── Items ─────────────────────────────────────────────────────────────
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommandItem> items = new ArrayList<>();


    private double totalPrice;
    private double deliveryFee;

    private String notes;

    private String guestFirstName;
    private String guestLastName;
    private String guestEmail;
    private String guestPhone;
}