package freelance.twin.sport.server.magasin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "magasin")
public class Magasin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;

    private String store_lat;
    private String store_lng;

    private String adress;
    private String city;
    private String region;

    private Integer deliveryFee;
    private String email;

    private String openingHours;
}
