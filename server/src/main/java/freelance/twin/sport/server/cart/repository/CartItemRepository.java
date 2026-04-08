package freelance.twin.sport.server.cart.repository;

import freelance.twin.sport.server.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.variant.id IN :variantIds")
    void deleteByCartIdAndVariantIds(
            @Param("cartId") Long cartId,
            @Param("variantIds") List<Long> variantIds
    );
}
