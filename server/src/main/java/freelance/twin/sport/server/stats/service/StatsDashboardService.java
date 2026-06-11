package freelance.twin.sport.server.stats.service;

import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.stats.dto.CategorieSales;
import freelance.twin.sport.server.stats.dto.DashboardSummaryDto;
import freelance.twin.sport.server.stats.dto.MonthlyStats;
import freelance.twin.sport.server.stats.repository.DashboardStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsDashboardService {

    private static final String[] MONTH_LABELS = {
            "", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
            "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"
    };
    private final DashboardStatsRepository dashboardStatsRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        return dashboardStatsRepository.getDashboardSummary();
    }
    @Transactional(readOnly = true)
    public List<CategorieSales> getCategorieSales(int year) {
        return dashboardStatsRepository.getCategorieSales(year);
    }

    @Transactional(readOnly = true)
    public List<MonthlyStats> getMonthlyStats(int year) {
        List<Status> statuses = List.of(Status.LIVREE, Status.RECUPEREE);
        List<MonthlyStats> raw = dashboardStatsRepository.findMonthlyStats(statuses, year);

        Map<String, MonthlyStats> byMonth = raw.stream()
                .collect(Collectors.toMap(MonthlyStats::getMonth, m -> m));

        List<MonthlyStats> full = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            String label = MONTH_LABELS[i];
            MonthlyStats m = byMonth.getOrDefault(label, new MonthlyStats(i, 0.0, 0.0, 0L));
            full.add(m);
        }

        for (int i = 0; i < full.size(); i++) {
            MonthlyStats prev = i > 0 ? full.get(i - 1) : null;
            full.get(i).setRevenueRate(calculateRate(full.get(i).getRevenue(), prev != null ? prev.getRevenue() : null));
            full.get(i).setProfitRate(calculateRate(full.get(i).getProfit(), prev != null ? prev.getProfit() : null));
        }

        return full;
    }

    private double calculateRate(Double current, Double previous) {
        if (current == null) return 0;
        if (previous == null || previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((current - previous) / previous) * 100.0 * 10) / 10.0;
    }

}
