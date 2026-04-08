package freelance.twin.sport.server.commande.repository;

import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.Status;
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
    List<Commande> findCommandesByUser_Id(UUID userId);

    @Query("""
    SELECT DISTINCT c FROM Commande c
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
    Page<Commande> findAllWithFilters(
            @Param("userId") UUID userId,
            @Param("search") String search,
            @Param("status") List<Status> status,
            Pageable pageable
    );

    Commande findCommandeByRef(String ref);
}
