package freelance.twin.sport.server.stats.dto;

import lombok.Data;

@Data
public class DashboardSummaryDto {

        private double WeektotalRevenue;
        private long WeektotalOrders;
        private long totalProducts;
        private long lowStockCount;
}
