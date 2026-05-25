package freelance.twin.sport.server.product.controller;

import freelance.twin.sport.server.product.dto.ProductVariantDTO;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.mapper.ProductMapper;
import freelance.twin.sport.server.product.service.ProductVarsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/product-vars")
@RequiredArgsConstructor
public class ProductVarsController {
    private final ProductVarsService productVarsService;
    @GetMapping("/variants/stock")
    public ProductVariantDTO getVariantStock(@RequestParam Long variantId) {
        return productVarsService.getVariantStock(variantId);
    }
    @GetMapping("/variants/stock/batch")
    public ResponseEntity<Map<Long, Integer>> getBatchStock(@RequestParam List<Long> variantIds) {
        return ResponseEntity.ok(productVarsService.getBatchStock(variantIds));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<ProductVariantDTO>> getProductVariants(
            @PathVariable Long productId
    ) {
        List<ProductVars> variants = productVarsService.retrieveVariantsByProduct(productId);

        List<ProductVariantDTO> dtoList = variants.stream().map(ProductMapper::toVarsDTO).toList();

        return ResponseEntity.ok(dtoList);
    }
}
