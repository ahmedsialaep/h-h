package freelance.twin.sport.server.cart.repository;

import freelance.twin.sport.server.cart.entity.Cart;
import freelance.twin.sport.server.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {


    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    Optional<Cart> findLatestCartByUserId(@Param("userId") UUID userId);

    Optional<Cart> findByUserId(UUID userId);

    Optional<Cart> findCartByUser_Id(UUID userId);
}
