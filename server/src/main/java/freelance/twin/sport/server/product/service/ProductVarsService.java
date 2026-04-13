package freelance.twin.sport.server.product.service;

import freelance.twin.sport.server.product.dto.ProductVariantDTO;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.repository.ProductRepository;
import freelance.twin.sport.server.product.repository.ProductVarsRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.Transient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVarsService {

    private final ProductVarsRepository productVarsRepository;
    private final ProductRepository productRepository;

    // Retrieve all variants
    public List<ProductVars> retrieveAllVariants() {
        return productVarsRepository.findAll();
    }

    // Retrieve a single variant by ID
    public ProductVars retrieveVariant(Long id) {
        return productVarsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product variant not found with id: " + id));
    }

    // Add or update a variant
    public ProductVars addOrUpdateVariant(ProductVars variant) {
        return productVarsRepository.save(variant);
    }
    @Transactional
    public List<ProductVars> saveVariants(Long productId, List<ProductVars> incomingVariants) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        List<ProductVars> result = new ArrayList<>();

        for (ProductVars incoming : incomingVariants) {
            if (incoming.getId() != null) {

                ProductVars existing = productVarsRepository.findById(incoming.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Variant not found"));

                int stockDelta = incoming.getStock() - existing.getStock();
                int newAvailable = existing.getAvailableQuantity() + stockDelta;

                if (newAvailable < 0) {
                    int reserved = existing.getStock() - existing.getAvailableQuantity();
                    throw new RuntimeException(
                            "Impossible de réduire le stock de la variante " +
                                    existing.getColor() + " taille " + existing.getSize() +
                                    " — " + reserved + " unité(s) actuellement réservée(s). " +
                                    "Stock minimum autorisé: " + (existing.getStock() - existing.getAvailableQuantity())
                    );
                }

                existing.setSize(incoming.getSize());
                existing.setColor(incoming.getColor());
                existing.setStock(incoming.getStock());
                existing.setAvailableQuantity(newAvailable);

                result.add(productVarsRepository.save(existing));

            } else {

                incoming.setProduct(product);
                incoming.setAvailableQuantity(incoming.getStock());
                result.add(productVarsRepository.save(incoming));
            }
        }

        // handle deleted variants — variants in DB but not in incoming list
        List<Long> incomingIds = incomingVariants.stream()
                .map(ProductVars::getId)
                .filter(Objects::nonNull)
                .toList();

        List<ProductVars> toDelete = productVarsRepository.findProductVarsByProduct_Id(productId).stream()
                .filter(v -> !incomingIds.contains(v.getId()))
                .toList();

        for (ProductVars deleted : toDelete) {
            int reserved = deleted.getStock() - deleted.getAvailableQuantity();
            if (reserved > 0) {
                throw new RuntimeException(
                        "Impossible de supprimer la variante " +
                                deleted.getColor() + " taille " + deleted.getSize() +
                                " — " + reserved + " unité(s) actuellement réservée(s)"
                );
            }
        }

        productVarsRepository.deleteAll(toDelete);

        return result;
    }
    // Remove a variant by ID
    public void removeVariant(Long id) {
        productVarsRepository.deleteById(id);
    }

    // Retrieve variants by product
    public List<ProductVars> retrieveVariantsByProduct(Long productId) {
        return productVarsRepository.findProductVarsByProduct_Id(productId);
    }
    public ProductVariantDTO getVariantStock(Long variantId) {
        return productVarsRepository.findById(variantId)
                .map(v -> new ProductVariantDTO(
                        v.getId(),
                        v.getSize(),
                        v.getColor(),
                        v.getStock(),
                        v.getSoldQuantity(),
                        v.getAvailableQuantity(),
                        v.getProduct().getId()
                ))
                .orElse(new ProductVariantDTO(variantId, null, null, 0, 0, 0, null));
    }

}