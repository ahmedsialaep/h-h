package freelance.twin.sport.server.product.repository;

import freelance.twin.sport.server.product.entity.Categorie;
import freelance.twin.sport.server.product.entity.Genre;
import freelance.twin.sport.server.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findProductByGender(Genre gender);

    List<Product> findProductsByCategorie(Categorie categorie);

    List<Product> findProductsByGender(Genre gender);

    List<Product> findProductsByBrand_Id(Long brandId);
    @Query("""
SELECT DISTINCT p FROM Product p
JOIN p.brand b
JOIN p.productType pt
LEFT JOIN p.variants v
WHERE (:brandIds IS NULL OR b.id IN :brandIds)
AND (:genres IS NULL OR p.gender IN :genres)
AND (:categories IS NULL OR p.categorie IN :categories)
AND (:types IS NULL OR pt.id IN :types)
AND (:colors IS NULL OR v.color IN :colors)
AND (:size IS NULL OR v.size IN :size)
AND (:minPrice IS NULL OR p.price >= :minPrice)
AND (:maxPrice IS NULL OR p.price <= :maxPrice)
AND (:newArrival IS NULL OR p.newArrival = :newArrival)
AND (:marketVisible IS NULL OR p.marketVisible IN :marketVisible)
AND (:search IS NULL OR
    LOWER(CAST(p.name AS string)) LIKE :search
    OR LOWER(CAST(p.ref AS string)) LIKE :search
    OR LOWER(CAST(b.brand_name AS string)) LIKE :search)
""")
    Page<Product> findAllWithFilters(
            @Param("brandIds") List<Long> brandIds,
            @Param("genres") List<Genre> genres,
            @Param("categories") List<Categorie> categories,
            @Param("types") List<Long> types,
            @Param("colors") List<String> colors,
            @Param("size") List<String> size,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("newArrival") Boolean newArrival,
            @Param("marketVisible") List<Boolean> marketVisible,
            @Param("search") String search,
            Pageable pageable
    );
}
