package freelance.twin.sport.server.product.service;

import freelance.twin.sport.server.product.entity.Brand;
import freelance.twin.sport.server.product.repository.BrandRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    // Retrieve all brands
    public List<Brand> retrieveAllBrands() {
        return brandRepository.findAll();
    }

    // Retrieve a single brand by ID
    public Brand retrieveBrand(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
    }

    // Add or update a brand
    public Brand addOrUpdateBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    // Remove a brand by ID
    public void removeBrand(Long id) {
        brandRepository.deleteById(id);
    }

    public Map<Long, Long> getProductCountsPerBrand() {
        return brandRepository.countProductsPerBrand()
                .stream()
                .collect(Collectors.toMap(
                        arr -> (Long) arr[0],
                        arr -> (Long) arr[1]
                ));
    }

}