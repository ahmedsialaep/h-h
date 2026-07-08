package freelance.twin.sport.server.user.controller;

import freelance.twin.sport.server.commande.service.CommandeService;
import freelance.twin.sport.server.magasin.entity.Magasin;
import freelance.twin.sport.server.magasin.service.MagasinService;
import freelance.twin.sport.server.product.dto.ProductDto;
import freelance.twin.sport.server.product.entity.Brand;
import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import freelance.twin.sport.server.product.entity.Type;
import freelance.twin.sport.server.product.mapper.ProductMapper;
import freelance.twin.sport.server.product.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BrandService brandService;
    private final ProductService productService;
    private final ProductVarsService varsService;
    private final ProductTypeService productTypeService;
    private final CommandeService commandeService;
    private final MagasinService magasinService;
    private final ImageStorageService imageStorageService;


    //brand
    @PostMapping(value = "/brand/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Brand> createBrand(
            @RequestPart("brand") Brand brand,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            String fileName = imageStorageService.saveImage(image);
            brand.setBrand_img(fileName);
        }
        Brand created = brandService.addOrUpdateBrand(brand);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Update an existing brand
    @PutMapping(value = "/brand/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Brand> updateBrand(
            @PathVariable Long id,
            @RequestPart("brand") Brand brand,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        brand.setId(id);
        if (image != null && !image.isEmpty()) {
            Brand existing = brandService.retrieveBrand(id);
            String oldImage = existing.getBrand_img();
            if (oldImage != null && !oldImage.isBlank()) {
                imageStorageService.deleteImage(Paths.get(oldImage).getFileName().toString());
            }
            brand.setBrand_img(imageStorageService.saveImage(image));
        }
        return ResponseEntity.ok(brandService.addOrUpdateBrand(brand));
    }

    // Delete a brand
    @DeleteMapping("/brand/delete/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.removeBrand(id);
        return ResponseEntity.noContent().build();
    }

    //product
    @PostMapping(value = "/product/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            String fileName = imageStorageService.saveImage(image);
            product.setImage(fileName);
        }
        Product saved = productService.addOrUpdateProduct(product);
        return new ResponseEntity<>(ProductMapper.toDetailDTO(saved), HttpStatus.CREATED);
    }

    @PutMapping(value = "/product/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") Product product,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        product.setId(id);
        if (image != null && !image.isEmpty()) {
            Product existing = productService.retrieveProduct(id);
            String oldImage = existing.getImage();
            if (oldImage != null && !oldImage.isBlank()) {
                imageStorageService.deleteImage(Paths.get(oldImage).getFileName().toString());
            }
            product.setImage(imageStorageService.saveImage(image));
        }
        Product saved = productService.addOrUpdateProduct(product);
        return ResponseEntity.ok(ProductMapper.toDetailDTO(saved));
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.removeProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/product/{id}/variants")
    public ResponseEntity<Void> saveVariants(
            @PathVariable Long id,
            @RequestBody List<ProductVars> variants
    ) {
        varsService.saveVariants(id, variants);
        return ResponseEntity.noContent().build();
    }


    // ProductType
    @PostMapping("/type/add")
    public ResponseEntity<Type> createProductType(@RequestBody Type type) {
        return new ResponseEntity<>(productTypeService.addOrUpdateProductType(type), HttpStatus.CREATED);
    }

    @PutMapping("/type/{id}")
    public ResponseEntity<Type> updateProductType(@PathVariable Long id, @RequestBody Type type) {
        type.setId(id);
        return ResponseEntity.ok(productTypeService.addOrUpdateProductType(type));
    }

    @DeleteMapping("/type/{id}")
    public ResponseEntity<Void> deleteProductType(@PathVariable Long id) {
        productTypeService.removeProductType(id);
        return ResponseEntity.noContent().build();
    }

    //commande


    //magasin

    @PostMapping("/magasin/add")
    public ResponseEntity<Magasin> createMagasin(@RequestBody Magasin magasin) {
        Magasin created = magasinService.addMagasin(magasin);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    @PutMapping("/magasin/update/{id}")
    public ResponseEntity<Magasin> updateMagasin(
            @PathVariable Long id,
            @RequestBody Magasin magasinDetails) {
        return ResponseEntity.ok(magasinService.updateMagasin(id, magasinDetails));
    }


    @DeleteMapping("/magasin/delete/{id}")
    public ResponseEntity<Void> deleteMagasin(@PathVariable Long id) {
        magasinService.removeMagasin(id);
        return ResponseEntity.noContent().build();
    }
}
