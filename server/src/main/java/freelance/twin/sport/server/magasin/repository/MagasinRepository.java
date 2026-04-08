package freelance.twin.sport.server.magasin.repository;

import freelance.twin.sport.server.magasin.entity.Magasin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MagasinRepository extends JpaRepository<Magasin,Long> {
}
