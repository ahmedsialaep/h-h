package freelance.twin.sport.server.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategorieSales {
    private String CategorieName;
    private long value;
    private double rate;
}
