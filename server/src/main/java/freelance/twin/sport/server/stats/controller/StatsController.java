package freelance.twin.sport.server.stats.controller;
import freelance.twin.sport.server.stats.dto.DashboardDto;
import freelance.twin.sport.server.stats.dto.MonthlyStats;
import freelance.twin.sport.server.stats.service.StatsDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/stats")
public class StatsController {

    private final StatsDashboardService statsDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<List<MonthlyStats>> getDashboard() {
        return ResponseEntity.ok(statsDashboardService.getMonthlyStats(2026));
    }

}
