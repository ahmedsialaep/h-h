package freelance.twin.sport.server.commande.repository;

import freelance.twin.sport.server.commande.dto.CommandeItemDto;
import freelance.twin.sport.server.commande.entity.CommandItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeItemRepository extends JpaRepository<CommandItem, Long> {


    List<CommandItem> findAllByCommande_Ref(String commandeRef);
}
