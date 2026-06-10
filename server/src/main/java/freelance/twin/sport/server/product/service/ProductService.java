package freelance.twin.sport.server.product.service;

import freelance.twin.sport.server.product.dto.ProductDto;
import freelance.twin.sport.server.product.dto.ProductFilterRequest;
import freelance.twin.sport.server.product.entity.Categorie;
import freelance.twin.sport.server.product.entity.Genre;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.exception.ProductNotFoundException;
import freelance.twin.sport.server.product.mapper.ProductMapper;
import freelance.twin.sport.server.product.repository.ProductRepository;
import freelance.twin.sport.server.product.repository.ProductVarsRepository;
import freelance.twin.sport.server.product.specification.ProductSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVarsRepository productVarsRepository;

    public Page<ProductDto> retrieveAllProductsShop(ProductFilterRequest filter) {

        Sort sort = filter.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(filter.getSortBy()).ascending()
                : Sort.by(filter.getSortBy()).descending();

        Pageable pageable = PageRequest.of(
                filter.getPage(),
                filter.getPageSize(),
                sort
        );

        /*
         * FETCH PRODUCTS
         */
        Page<Product> productsPage =
                productRepository.findAll(
                        ProductSpecification.withFilters(filter),
                        pageable
                );

        /*
         * FETCH PRODUCT IDS
         */
        List<Long> productIds = productsPage.getContent()
                .stream()
                .map(Product::getId)
                .toList();

        /*
         * FETCH STOCK AGGREGATION
         */
        List<Object[]> stockRows =
                productVarsRepository.getStockStats(productIds);

        /*
         * CONVERT TO MAP
         */
        Map<Long, int[]> stockMap = new HashMap<>();

        for (Object[] row : stockRows) {

            Long productId = (Long) row[0];

            int totalStock =
                    ((Number) row[1]).intValue();

            int totalAvailable =
                    ((Number) row[2]).intValue();

            stockMap.put(
                    productId,
                    new int[]{totalStock, totalAvailable}
            );
        }

        /*
         * DTO MAPPING
         */
        return productsPage.map(product -> {

            int[] stats =
                    stockMap.getOrDefault(
                            product.getId(),
                            new int[]{0, 0}
                    );

            return ProductMapper.toDTOadmin(
                    product,
                    stats[0],
                    stats[1]
            );
        });
    }

    public List<Product> retrieveAllProducts() {
        return productRepository.findAll();
    }

    public Product retrieveProduct(Long id) {
        return (Product) productRepository.findProductById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );
    }

    @Transactional
    public Product addOrUpdateProduct(Product product) {

        if (product.getId() != null) {

            Product existing = (Product) productRepository.findProductById(product.getId())
                    .orElseThrow(() ->
                            new ProductNotFoundException("Product not found")
                    );

            existing.setName(product.getName());
            existing.setRef(product.getRef());
            existing.setGender(product.getGender());
            existing.setCategorie(product.getCategorie());
            existing.setPrice(product.getPrice());
            existing.setOriginalPrice(product.getOriginalPrice());
            existing.setBuyPrice(product.getBuyPrice());
            existing.setDescription(product.getDescription());
            existing.setNewArrival(product.isNewArrival());
            existing.setMarketVisible(product.isMarketVisible());
            existing.setImage(product.getImage());

            existing.setBrand(product.getBrand());
            existing.setProductType(product.getProductType());

            return productRepository.save(existing);
        }

        return productRepository.save(product);
    }

    public void removeProduct(Long id) {
        productRepository.deleteById(id);
    }

}