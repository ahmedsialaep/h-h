package freelance.twin.sport.server.product.repository;

import freelance.twin.sport.server.product.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand,Long> {
    @Query("SELECT p.brand.id, COUNT(p) FROM Product p GROUP BY p.brand.id")
    List<Object[]> countProductsPerBrand();
}
