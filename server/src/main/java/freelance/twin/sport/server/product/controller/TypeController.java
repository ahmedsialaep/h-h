package freelance.twin.sport.server.product.controller;

import freelance.twin.sport.server.product.entity.Type;
import freelance.twin.sport.server.product.service.ProductService;
import freelance.twin.sport.server.product.service.ProductTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/product-type")
@RequiredArgsConstructor
public class TypeController {

    private final ProductTypeService typeService;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Type>> retrieveAllTypes(){
        return ResponseEntity.ok(typeService.retrieveAllProductTypes());
    }
}
