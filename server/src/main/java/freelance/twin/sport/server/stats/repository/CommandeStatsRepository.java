package freelance.twin.sport.server.stats.repository;

import freelance.twin.sport.server.commande.entity.Commande;
import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.stats.projection.MonthlyStatsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeStatsRepository extends JpaRepository<Commande, Long> {

    @Query("""
    SELECT
        MONTH(c.createdAt)                                                          AS monthNumber,
        SUM(CASE WHEN c.status IN :statuses THEN c.totalPrice ELSE 0 END)              AS revenue,
        SUM(CASE WHEN c.status IN :statuses THEN (i.unitPrice - i.product.buyPrice) * i.quantity ELSE 0 END) AS profit,
        COUNT(DISTINCT c.id)                                                        AS orders
    FROM Commande c
    JOIN c.items i
    WHERE YEAR(c.createdAt) = :year
    GROUP BY MONTH(c.createdAt)
    ORDER BY MONTH(c.createdAt)
""")
    List<MonthlyStatsProjection> findMonthlyStats(
            @Param("statuses") List<Status> statuses,
            @Param("year") int year
    );

}
