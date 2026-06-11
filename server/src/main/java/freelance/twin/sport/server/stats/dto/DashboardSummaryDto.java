package freelance.twin.sport.server.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDto {

        private double WeekTotalRevenue;
        private long WeekTotalOrders;
        private long todayWaitingOrders;
        private long lowStockCount;
}
