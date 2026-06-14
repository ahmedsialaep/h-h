package freelance.twin.sport.server.commande.controller;

import freelance.twin.sport.server.commande.dto.CommandeDto;
import freelance.twin.sport.server.commande.dto.CommandeFilterRequest;
import freelance.twin.sport.server.commande.dto.CommandeItemDto;
import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.commande.mapper.CommandeMapper;
import freelance.twin.sport.server.commande.service.CommandeService;
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
    public ResponseEntity<Map<String, Object>> getAllCommandes(
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

        Page<Commande> commandePage = commandeService.retrieveAllCommandes(filter);
        List<CommandeDto> commandesDTO = commandePage.getContent()
                .stream()
                .map(CommandeMapper::toDTO)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("content", commandesDTO);
        response.put("currentPage", commandePage.getNumber());
        response.put("totalItems", commandePage.getTotalElements());
        response.put("totalPages", commandePage.getTotalPages());
        response.put("pageSize", commandePage.getSize());

        return ResponseEntity.ok(response);
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
