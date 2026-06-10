package freelance.twin.sport.server.stats.dto;

import lombok.Data;

@Data
public class MonthlyStats {
    private String month;
    private double revenue;
    private long orders;
    private double profit;
}
