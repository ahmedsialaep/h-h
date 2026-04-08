package freelance.twin.sport.server.magasin.controller;

import freelance.twin.sport.server.magasin.entity.Magasin;
import freelance.twin.sport.server.magasin.service.MagasinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/magasin")
@RequiredArgsConstructor
public class MagasinController {

    private final MagasinService magasinService;

    // Retrieve all magasins
    @GetMapping
    public ResponseEntity<List<Magasin>> getAllMagasins() {
        return ResponseEntity.ok(magasinService.retrieveAllMagasins());
    }

    // Retrieve a single magasin by ID
    @GetMapping("/{id}")
    public ResponseEntity<Magasin> getMagasinById(@PathVariable Long id) {
        return ResponseEntity.ok(magasinService.retrieveMagasin(id));
    }
}
