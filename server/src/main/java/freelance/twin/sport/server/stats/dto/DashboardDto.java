package freelance.twin.sport.server.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardDto {
    private DashboardSummaryDto summary;
    private List<MonthlyStats> monthlyStats;
    private List<CategorieSales> categoryStats;
}
