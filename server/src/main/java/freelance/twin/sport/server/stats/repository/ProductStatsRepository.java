package freelance.twin.sport.server.stats.repository;

import freelance.twin.sport.server.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductStatsRepository extends JpaRepository<Product, Long> {
}
