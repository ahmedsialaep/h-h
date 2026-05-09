package freelance.twin.sport.server.product.repository;

import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVarsRepository extends JpaRepository<ProductVars, Long> {
    List<ProductVars> findProductVarsByProduct_Id(Long productId);

    @Query("SELECT v FROM ProductVars v WHERE v.id IN :ids")
    List<ProductVars> findAllByIds(@Param("ids") List<Long> ids);
    void deleteProductVarsByProduct(Product product);
}
