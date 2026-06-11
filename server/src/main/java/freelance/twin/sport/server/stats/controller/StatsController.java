package freelance.twin.sport.server.stats.controller;

import freelance.twin.sport.server.stats.dto.DashboardDto;
import freelance.twin.sport.server.stats.service.StatsDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/stats")
public class StatsController {

    private final StatsDashboardService statsDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard(@RequestParam(defaultValue = "2026") int year) {
        DashboardDto dto = new DashboardDto(
                statsDashboardService.getDashboardSummary(),
                statsDashboardService.getMonthlyStats(year),
                statsDashboardService.getCategorieSales(year)
        );
        return ResponseEntity.ok(dto);
    }

}
