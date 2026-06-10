package freelance.twin.sport.server.stats.projection;

public interface MonthlyStatsProjection {
    Integer getMonthNumber();
    String getMonthLabel();
    Double getRevenue();
    Double getProfit();
    Long getOrders();
}
