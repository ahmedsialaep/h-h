package freelance.twin.sport.server.product.controller;

import freelance.twin.sport.server.product.dto.ProductVariantDTO;
import freelance.twin.sport.server.product.service.ProductVarsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-vars")
@RequiredArgsConstructor
public class ProductVarsController {
    private final ProductVarsService productVarsService;
    @GetMapping("/variants/stock")
    public ProductVariantDTO getVariantStock(@RequestParam Long variantId) {
        return productVarsService.getVariantStock(variantId);
    }
}
