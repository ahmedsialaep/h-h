package freelance.twin.sport.server.product.service;

import freelance.twin.sport.server.product.entity.Type;
import freelance.twin.sport.server.product.repository.TypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductTypeService {
    private final TypeRepository typeRepository;

    // Retrieve all product types
    public List<Type> retrieveAllProductTypes() {
        return typeRepository.findAll();
    }

    // Retrieve a single product type by ID
    public Type retrieveProductType(Long id) {
        return typeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product type not found with id: " + id));
    }

    // Add or update a product type
    public Type addOrUpdateProductType(Type type) {
        return typeRepository.save(type);
    }

    // Remove a product type by ID
    public void removeProductType(Long id) {
        typeRepository.deleteById(id);
    }
}
