package freelance.twin.sport.server.commande.controller;

import freelance.twin.sport.server.commande.dto.CommandeDto;
import freelance.twin.sport.server.commande.dto.CommandeFilterRequest;
import freelance.twin.sport.server.commande.dto.CommandeItemDto;
import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.commande.mapper.CommandeMapper;
import freelance.twin.sport.server.commande.service.CommandeService;
import freelance.twin.sport.server.config.custom.PagedResponse;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/commande")
@RequiredArgsConstructor
public class CommandeAdminController {
    private final CommandeService commandeService;
    private final UserService userService;

    @GetMapping("/items")
    public ResponseEntity<List<CommandeItemDto>> getCommandesItems(@RequestParam String ref) {

        List<CommandeItemDto> commandeItemDtos = commandeService.findCommandeItemsByRef(ref);
        return ResponseEntity.ok(commandeItemDtos);
    }
    @GetMapping("/getAll")
    public ResponseEntity<PagedResponse<CommandeDto>> getAllCommandes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<Status> statuses
    ) {
        CommandeFilterRequest filter = new CommandeFilterRequest();
        filter.setPage(page);
        filter.setPageSize(pageSize);
        filter.setUserId(userId);
        filter.setSearch(search);
        filter.setStatus(statuses);

        return ResponseEntity.ok(PagedResponse.of(commandeService.retrieveAllCommandes(filter)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatut(
            @PathVariable Long id,
            @RequestParam Status status,
            @RequestParam(required = false) String commentaire
    ) {
        Commande commande= commandeService.updateStatus(id, status,commentaire);

        return ResponseEntity.ok(CommandeMapper.toDTO(commande));
    }
}
