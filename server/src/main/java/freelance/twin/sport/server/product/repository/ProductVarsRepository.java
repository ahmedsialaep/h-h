package freelance.twin.sport.server.product.repository;

import freelance.twin.sport.server.product.entity.Product;
import freelance.twin.sport.server.product.entity.ProductVars;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("""
    SELECT
        v.product.id,
        COALESCE(SUM(v.stock), 0),
        COALESCE(SUM(v.availableQuantity), 0)
    FROM ProductVars v
    WHERE v.product.id IN :productIds
    GROUP BY v.product.id
""")
    List<Object[]> getStockStats(
            @Param("productIds") List<Long> productIds
    );

    @Modifying
    @Query("UPDATE ProductVars p SET p.availableQuantity = p.availableQuantity - :qty " +
            "WHERE p.id = :variantId AND p.availableQuantity >= :qty")
    int decrementStock(@Param("variantId") Long variantId, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE ProductVars p SET p.availableQuantity = p.availableQuantity + :qty " +
            "WHERE p.id = :variantId")
    void incrementStock(@Param("variantId") Long variantId, @Param("qty") int qty);
}
