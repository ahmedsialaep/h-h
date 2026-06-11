package freelance.twin.sport.server.stats.repository;

import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.stats.dto.CategorieSales;
import freelance.twin.sport.server.stats.dto.DashboardSummaryDto;
import freelance.twin.sport.server.stats.dto.MonthlyStats;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class DashboardStatsRepository {

    @PersistenceContext
    private final EntityManager entityManager;

    public List<MonthlyStats> findMonthlyStats(
            List<Status> statuses,
            int year) {

        return entityManager.createQuery("""
                        SELECT new freelance.twin.sport.server.stats.dto.MonthlyStats(
                            MONTH(c.createdAt),
                            COALESCE(SUM(
                                CASE WHEN c.status IN :statuses
                                THEN c.totalPrice
                                ELSE 0
                                END
                            ),0),
                            COALESCE(SUM(
                                CASE WHEN c.status IN :statuses
                                THEN (i.unitPrice - i.product.buyPrice) * i.quantity
                                ELSE 0
                                END
                            ),0),
                            COUNT(DISTINCT c.id)
                        )
                        FROM Commande c
                        JOIN c.items i
                        WHERE YEAR(c.createdAt) = :year
                        GROUP BY MONTH(c.createdAt)
                        ORDER BY MONTH(c.createdAt)
                        """, MonthlyStats.class)
                .setParameter("statuses", statuses)
                .setParameter("year", year)
                .getResultList();
    }

    public DashboardSummaryDto getDashboardSummary() {

        Object[] summaryResult = (Object[]) entityManager.createQuery("""
                            SELECT
                                COALESCE(SUM(CASE WHEN c.status IN :statuses AND c.createdAt >= :weekStart
                                             THEN c.totalPrice ELSE 0 END), 0),
                                COUNT(DISTINCT (CASE WHEN c.createdAt >= :weekStart THEN c.id END)),
                                COUNT(DISTINCT (CASE WHEN c.status = :pending AND c.createdAt >= :startOfDay
                                                   AND c.createdAt < :endOfDay THEN c.id END))
                            FROM Commande c
                            JOIN c.items i
                        """)
                .setParameter("statuses", List.of(Status.LIVREE, Status.RECUPEREE))
                .setParameter("weekStart", LocalDateTime.now().with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay())
                .setParameter("pending", Status.EN_ATTENTE)
                .setParameter("startOfDay", LocalDate.now().atStartOfDay())
                .setParameter("endOfDay", LocalDate.now().atTime(LocalTime.MAX))
                .getSingleResult();

        Long lowStock = (Long) entityManager.createQuery("""
                            SELECT COUNT(v)
                            FROM ProductVars v
                            WHERE v.stock <= 5
                        """)
                .getSingleResult();

        return new DashboardSummaryDto(
                ((Number) summaryResult[0]).doubleValue(),
                ((Number) summaryResult[1]).longValue(),
                ((Number) summaryResult[2]).longValue(),
                lowStock != null ? lowStock : 0
        );
    }
    public List<CategorieSales> getCategorieSales(int year) {

        List<Object[]> raw = entityManager.createQuery("""
        SELECT p.categorie, COUNT(DISTINCT c.id)
        FROM Commande c
        JOIN c.items i
        JOIN i.product p
        WHERE c.status IN :statuses
        AND YEAR(c.createdAt) = :year
        GROUP BY p.categorie
        ORDER BY COUNT(DISTINCT c.id) DESC
    """)
                .setParameter("statuses", List.of(Status.LIVREE, Status.RECUPEREE))
                .setParameter("year", year)
                .getResultList();

        long total = raw.stream()
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();

        return raw.stream().map(r -> {
            CategorieSales dto = new CategorieSales();
            dto.setCategorieName(r[0].toString());
            dto.setValue(((Number) r[1]).longValue());
            dto.setRate(total > 0 ? Math.round(((Number) r[1]).doubleValue() / total * 100.0 * 10) / 10.0 : 0);
            return dto;
        }).toList();
    }
}
