package freelance.twin.sport.server.product.controller;

import freelance.twin.sport.server.product.entity.Brand;
import freelance.twin.sport.server.product.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/brand")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    // Get all brands
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.retrieveAllBrands();
        return ResponseEntity.ok(brands);
    }

    // Get a single brand by ID
    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.retrieveBrand(id);
        return ResponseEntity.ok(brand);
    }

    @GetMapping("/product-counts")
    public ResponseEntity<Map<Long, Long>> getProductCountsPerBrand() {
        return ResponseEntity.ok(brandService.getProductCountsPerBrand());
    }

}