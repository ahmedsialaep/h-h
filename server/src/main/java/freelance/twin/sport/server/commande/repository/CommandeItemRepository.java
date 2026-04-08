package freelance.twin.sport.server.commande.repository;

import freelance.twin.sport.server.commande.entity.CommandItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommandeItemRepository extends JpaRepository<CommandItem, Long> {
}
