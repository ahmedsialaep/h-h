package freelance.twin.sport.server.product.repository;

import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVarsRepository extends JpaRepository<ProductVars, Long> {
    List<ProductVars> findProductVarsByProduct_Id(Long productId);

    void deleteProductVarsByProduct(Product product);
}
