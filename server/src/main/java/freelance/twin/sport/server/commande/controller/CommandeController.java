package freelance.twin.sport.server.commande.controller;

import freelance.twin.sport.server.commande.dto.CommandeDto;
import freelance.twin.sport.server.commande.dto.CommandeRequest;
import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.mapper.CommandeMapper;
import freelance.twin.sport.server.commande.service.CommandeService;
import freelance.twin.sport.server.product.dto.ProductDto;
import freelance.twin.sport.server.product.mapper.ProductMapper;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.service.UserService;
import freelance.twin.sport.server.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
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
    private final JwtUtils jwtService;

    @PostMapping("/checkout")
    public ResponseEntity<Commande> checkout(
            @RequestBody CommandeRequest request

    ) {

        User user = userService.getCurrentUser();

        return ResponseEntity.ok(commandeService.createCommande(request, user.getId()));
    }
    @GetMapping("/{ref}")
    public ResponseEntity<?> findByRef(
            @PathVariable(name = "ref") String ref

    ) {
        Commande commande = commandeService.findByRef(ref);
        CommandeDto dto= CommandeMapper.toDTO(commande);
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/my-orders")
    public ResponseEntity<List<CommandeDto>> getMesCommandes() {

        User user = userService.getCurrentUser();

        List<Commande> commandeList = commandeService.retrieveAllCommandesByUser(user.getId());
        List<CommandeDto> commandesDTO = commandeList
                .stream()
                .map(CommandeMapper::toDTO)
                .toList();

        return ResponseEntity.ok(commandesDTO);
    }
}
