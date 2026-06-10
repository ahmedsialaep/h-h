package freelance.twin.sport.server.stats.service;

import freelance.twin.sport.server.commande.entity.Status;
import freelance.twin.sport.server.commande.repository.CommandeRepository;
import freelance.twin.sport.server.stats.dto.MonthlyStats;
import freelance.twin.sport.server.stats.repository.CommandeStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsDashboardService {

    private final CommandeStatsRepository commandeStatsRepository;

    private static final String[] MONTH_LABELS = {
            "", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
            "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"
    };

    @Transactional(readOnly = true)
    public List<MonthlyStats> getMonthlyStats(int year) {
        List<Status> statuses = List.of(Status.LIVREE, Status.RECUPEREE);

        return commandeStatsRepository.findMonthlyStats(statuses, year)
                .stream()
                .map(p -> {
                    MonthlyStats dto = new MonthlyStats();
                    dto.setMonth(MONTH_LABELS[p.getMonthNumber()]);
                    dto.setRevenue(p.getRevenue());
                    dto.setProfit(p.getProfit());
                    dto.setOrders(p.getOrders());
                    return dto;
                })
                .toList();
    }

}
