package freelance.twin.sport.server.product.controller;

import freelance.twin.sport.server.product.dto.ProductDto;
import freelance.twin.sport.server.product.dto.ProductFilterRequest;
import freelance.twin.sport.server.product.entity.Categorie;
import freelance.twin.sport.server.product.entity.Genre;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.mapper.ProductMapper;
import freelance.twin.sport.server.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(required = false) List<Genre> genres,
            @RequestParam(required = false) List<Categorie> categories,
            @RequestParam(required = false) List<Long> types,
            @RequestParam(required = false) List<String> colors,
            @RequestParam(required = false) Boolean newArrival,
            @RequestParam(required = false) List<Boolean> marketVisible,
            @RequestParam(required = false) List<String> size,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        ProductFilterRequest filter = new ProductFilterRequest();
        filter.setBrandIds(brandIds);
        filter.setGenres(genres);
        filter.setCategories(categories);
        filter.setTypes(types);
        filter.setColors(colors);
        filter.setNewArrival(newArrival);
        filter.setSize(size);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setPage(page);
        filter.setPageSize(pageSize);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);
        filter.setMarketVisible(marketVisible);
        filter.setSearch(search);
        Page<Product> productsPage = productService.retrieveAllProducts(filter);

        List<ProductDto> productsDTO = productsPage.getContent()
                .stream()
                .map(ProductMapper::toDTO)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("content", productsDTO);
        response.put("currentPage", productsPage.getNumber());
        response.put("totalItems", productsPage.getTotalElements());
        response.put("totalPages", productsPage.getTotalPages());
        response.put("pageSize", productsPage.getSize());

        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> findProductById(@PathVariable(name = "id") Long id_product) {
        Product found = productService.retrieveProduct(id_product);
        ProductDto productDto = ProductMapper.toDTO(found);
        return ResponseEntity.ok(productDto);
    }
}
