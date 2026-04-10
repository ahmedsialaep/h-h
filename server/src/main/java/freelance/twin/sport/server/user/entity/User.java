package freelance.twin.sport.server.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Table(name = "users")
@Entity
public class User {
    @Id
    @GeneratedValue
    private UUID id;


    private String nom;


    private String prenom;

    @Enumerated(EnumType.STRING)
    private Role roleUser;


    private String username;

    private String pwd;
    private String img;

    private Instant last2FaVerification;

    private String codeVerification2FA;

    @Enumerated(EnumType.STRING)
    private TwofaMethod twoFaMethod;

    private Instant twoFaCodeExpiry;

    private String numTel;

    private Long CodePostal;

    private String ville;

    private String region;



}
