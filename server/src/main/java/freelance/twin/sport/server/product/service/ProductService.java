package freelance.twin.sport.server.product.service;

import freelance.twin.sport.server.product.dto.ProductFilterRequest;
import freelance.twin.sport.server.product.entity.Brand;
import freelance.twin.sport.server.product.entity.Categorie;
import freelance.twin.sport.server.product.entity.Genre;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<Product> retrieveAllProducts(ProductFilterRequest filter) {
        Sort sort = filter.getSortDir().equalsIgnoreCase("desc")
                ? Sort.by(filter.getSortBy()).descending()
                : Sort.by(filter.getSortBy()).ascending();

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getPageSize(), sort);

        String cleanSearch = (filter.getSearch() != null && !filter.getSearch().isBlank())
                ? filter.getSearch().trim()
                : null;

        return productRepository.findAllWithFilters(
                filter.getBrandIds(),
                filter.getGenres(),
                filter.getCategories(),
                filter.getTypes(),
                filter.getColors(),
                filter.getSize(),
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getNewArrival(),
                filter.getMarketVisible(),
                cleanSearch,
                pageable
        );
    }

    public Specification<Product> buildProductSearchSpec(String search) {
        String normalizedSearch = "%" + search.toLowerCase().trim() + "%";


        return (root, query, cb) -> {
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            Predicate namePred = cb.like(cb.lower(cb.trim(root.get("name"))), normalizedSearch);
            Predicate refPred = cb.like(cb.lower(cb.trim(root.get("ref"))), normalizedSearch);

            Join<Product, Brand> brandJoin = root.join("brand", JoinType.LEFT);
            Predicate brandPred = cb.like(cb.lower(cb.trim(brandJoin.get("brand_name"))), normalizedSearch);

            predicates.add(namePred);
            predicates.add(refPred);
            predicates.add(brandPred);

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
    public List<Product> retrieveAllProducts() {
        return productRepository.findAll();
    }

    public Product retrieveProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }

    public Product addOrUpdateProduct(Product product) {
        if (product.getId() != null) {

            Product existing = productRepository.findById(product.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            product.setVariants(existing.getVariants());
        }
        return productRepository.save(product);
    }

    public void removeProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> retrieveProductsByBrand(Long brandId) {
        return productRepository.findProductsByBrand_Id(brandId);
    }

    public List<Product> retrieveProductsByCategory(Categorie categorie) {
        return productRepository.findProductsByCategorie(categorie);
    }

    public List<Product> retrieveProductsByGender(Genre gender) {
        return productRepository.findProductsByGender(gender);
    }
}