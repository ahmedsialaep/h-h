package freelance.twin.sport.server.commande.repository;

import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.commande.projection.CommandeProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.UUID;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    @Query("""
    SELECT DISTINCT
        c.id AS id, c.adress AS adress, c.city AS city, c.ref AS ref,
        c.deliveryMethod AS deliveryMethod, c.notes AS notes, c.commentaire AS commentaire,
        c.createdAt AS createdAt, c.status AS status, c.updatedAt AS updatedAt,
        c.phone AS phone, c.totalPrice AS totalPrice, c.deliveryFee AS deliveryFee,
        u.id AS userId, u.username AS username, u.nom AS userNom, u.prenom AS userPrenom,
        c.guestFirstName AS guestFirstName, c.guestLastName AS guestLastName,
        c.guestEmail AS guestEmail, c.guestPhone AS guestPhone
    FROM Commande c
    LEFT JOIN c.user u
    WHERE (:userId IS NULL OR u.id = :userId)
    AND (:status IS NULL OR c.status IN :status)
    AND (:search IS NULL OR
        LOWER(c.ref) LIKE :search
        OR LOWER(u.nom) LIKE :search
        OR LOWER(u.prenom) LIKE :search
        OR LOWER(u.username) LIKE :search
        OR LOWER(c.guestFirstName) LIKE :search
        OR LOWER(c.guestLastName) LIKE :search
        OR LOWER(c.guestEmail) LIKE :search
        OR c.guestPhone LIKE :search
    )
    ORDER BY c.createdAt DESC
""")
    Page<CommandeProjection> findAllWithFilters(
            @Param("userId") UUID userId,
            @Param("search") String search,
            @Param("status") List<Status> status,
            Pageable pageable
    );

    Commande findCommandeByRef(String ref);


    List<CommandeProjection> findCommandesByUser_IdOrderByCreatedAtDesc(UUID userId);
}
