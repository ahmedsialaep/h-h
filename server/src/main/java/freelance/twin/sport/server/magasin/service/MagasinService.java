package freelance.twin.sport.server.magasin.service;

import freelance.twin.sport.server.magasin.entity.Magasin;
import freelance.twin.sport.server.magasin.repository.MagasinRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MagasinService {
    private final MagasinRepository magasinRepository;

    // Retrieve all magasins
    public List<Magasin> retrieveAllMagasins() {
        return magasinRepository.findAll();
    }

    // Retrieve a single magasin by ID
    public Magasin retrieveMagasin(Long id) {
        return magasinRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Magasin not found with id: " + id));
    }

    // Add or update a magasin
    public Magasin addMagasin(Magasin magasin) {
        return magasinRepository.save(magasin);
    }
    public Magasin updateMagasin(Long id, Magasin details) {
        Magasin existing = magasinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Magasin not found"));

        if (details.getName() != null) existing.setName(details.getName());
        if (details.getPhone() != null) existing.setPhone(details.getPhone());
        if (details.getEmail() != null) existing.setEmail(details.getEmail());
        if (details.getStore_lat() != null) existing.setStore_lat(details.getStore_lat());
        if (details.getStore_lng() != null) existing.setStore_lng(details.getStore_lng());
        if (details.getAdress() != null) existing.setAdress(details.getAdress());
        if (details.getCity() != null) existing.setCity(details.getCity());
        if (details.getRegion() != null) existing.setRegion(details.getRegion());
        if (details.getDeliveryFee() != null) existing.setDeliveryFee(details.getDeliveryFee());
        if (details.getOpeningHours() != null) existing.setOpeningHours(details.getOpeningHours());

        return magasinRepository.save(existing);
    }

    // Remove a magasin by ID
    public void removeMagasin(Long id) {
        magasinRepository.deleteById(id);
    }
}
