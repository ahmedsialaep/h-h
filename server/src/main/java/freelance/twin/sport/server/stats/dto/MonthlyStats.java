package freelance.twin.sport.server.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyStats {
    private String month;
    private double revenue;
    private long orders;
    private double profit;
    private double profitRate;
    private double revenueRate;

    private static final String[] MONTH_LABELS = {
            "", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
            "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"
    };

    public MonthlyStats(Integer monthNumber, Double revenue, Double profit, Long orders) {

        this.month = MONTH_LABELS[monthNumber];
        this.revenue = revenue != null ? revenue : 0;
        this.profit = profit != null ? profit : 0;
        this.orders = orders != null ? orders : 0;
    }
}
