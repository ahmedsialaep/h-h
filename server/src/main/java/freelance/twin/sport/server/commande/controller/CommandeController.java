package freelance.twin.sport.server.commande.controller;

import freelance.twin.sport.server.commande.dto.CommandeDto;
import freelance.twin.sport.server.commande.dto.CommandeFilterRequest;
import freelance.twin.sport.server.commande.dto.CommandeRequest;
import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.mapper.CommandeMapper;
import freelance.twin.sport.server.commande.service.CommandeService;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/commande")
@RequiredArgsConstructor
public class CommandeController {
    private final CommandeService commandeService;
    private final UserService userService;


    @PostMapping("/checkout")
    public ResponseEntity<CommandeDto> checkout(@RequestBody CommandeRequest request) {
        User user = userService.getCurrentUser();
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(commandeService.createCommande(request, userId));
    }

    @GetMapping("/{ref}")
    public ResponseEntity<CommandeDto> findByRef(@PathVariable String ref) {
        return ResponseEntity.ok(commandeService.findByRef(ref));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<Page<CommandeDto>> getMesCommandes(CommandeFilterRequest filter) {
        filter.setUserId(userService.getCurrentUser().getId());
        return ResponseEntity.ok(commandeService.retrieveAllCommandes(filter));
    }

}
